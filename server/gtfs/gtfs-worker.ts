import { TrainQuery } from "../ctx/trainquery";
import { GtfsData } from "./data/gtfs-data";
import {
  GtfsConfig,
  GtfsFeedConfig,
  GtfsRealtimeConfig,
} from "../config/gtfs-config";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { QTime } from "../../shared/qtime/qtime";
import { downloadGtfs } from "./fetch";
import { GtfsRealtimeData, fetchRealtime } from "./realtime/fetch";
import { applyRealtimeData } from "./realtime/apply-realtime-data";

// How often to CHECK if the data is outdated. We should check far more often
// than the refresh interval itself because when the data is pulled from the
// database it could be any age!
const checkOutdatedInterval = 10 * 60 * 1000;

export class GtfsWorker {
  private _data: GtfsData | null;
  private _dataNoRealtime: GtfsData | null;
  private readonly _gtfsConfig: GtfsConfig<true> | GtfsConfig<false>;
  private _lastAttempt: QUtcDateTime | null;
  private _realtimeWorkers: GtfsRealtimeWorker[];

  constructor(private readonly _ctx: TrainQuery) {
    this._data = null;
    this._dataNoRealtime = null;
    this._lastAttempt = null;
    const gtfsConfig = this._ctx.getConfig().server.gtfs;
    if (gtfsConfig == null) {
      throw new Error("Cannot create GTFS worker. No GTFS config provided.");
    }
    this._gtfsConfig = gtfsConfig;

    // Create the realtime workers for each subfeed.
    if (!_ctx.isOffline) {
      const subworker = (x: GtfsFeedConfig, name: string | null) =>
        new GtfsRealtimeWorker(
          _ctx,
          x.realtime,
          () => this._applyRealtimeData(),
          name,
        );
      if (this._gtfsConfig.usesSubfeeds) {
        this._realtimeWorkers = this._gtfsConfig.subfeeds.map((x) =>
          subworker(x, x.name),
        );
      } else {
        this._realtimeWorkers = [subworker(this._gtfsConfig.feed, null)];
      }
    } else {
      this._realtimeWorkers = [];
    }
  }

  init() {
    (async () => {
      // First, attempt to retrieve the saved GTFS data from the database.
      if (this._gtfsConfig.persist && this._ctx.database != null) {
        try {
          this._ctx.logger.logRecallingGtfs();
          this._data = await this._ctx.database.fetchGtfs(
            this._ctx.getConfig().hash,
          );
          this._applyRealtimeData();

          if (this._data != null) {
            this._lastAttempt = this._data.age;
            this._ctx.logger.logRecallingGtfsSuccess();
          } else {
            this._ctx.logger.logRecallingGtfsEmpty();
          }
        } catch (err) {
          this._ctx.logger.logRecallingGtfsFailure(err);
        }
      }

      // Next, begin a polling process which refreshes the GTFS data when
      // necessary.
      const refreshTime = new QTime(this._gtfsConfig.refreshHourUtc, 0, 0);
      const refreshIfNeeded = () => {
        if (!this._ctx.isProduction && this._gtfsConfig.isOnlineSource()) {
          return;
        }

        if (this._lastAttempt == null) {
          this._refresh();
          return;
        }

        const now = nowUTC();
        const thresholdToday = new QUtcDateTime(now.date, refreshTime);
        const thresholdYesterday = new QUtcDateTime(
          now.date.addDays(-1),
          refreshTime,
        );

        if (
          this._lastAttempt.isBefore(thresholdYesterday) ||
          (this._lastAttempt.isBefore(thresholdToday) &&
            now.isAfterOrEqual(thresholdToday))
        ) {
          this._refresh();
        }
      };
      refreshIfNeeded();
      if (this._gtfsConfig.isOnlineSource()) {
        setInterval(refreshIfNeeded, checkOutdatedInterval);
      }
    })();
  }

  private async _refresh() {
    this._lastAttempt = nowUTC();

    try {
      this._ctx.logger.logRefreshingGtfs();
      const data = await downloadGtfs(this._ctx, this._gtfsConfig);
      this._data = data;
      this._ctx.logger.logRefreshingGtfsSuccess();
      this._applyRealtimeData();
    } catch (err) {
      this._ctx.logger.logRefreshingGtfsFailure(err);
    }

    if (
      this._data != null &&
      this._gtfsConfig.persist &&
      this._ctx.database != null
    ) {
      try {
        this._ctx.logger.logPersistingGtfs();
        await this._ctx.database.writeGtfs(this._data);
        this._ctx.logger.logPersistingGtfsSuccess();
      } catch (err) {
        this._ctx.logger.logPersistingGtfsFailure(err);
      }
    }
  }

  private _applyRealtimeData() {
    if (this._data == null) {
      return;
    }
    let data = this._data.withoutLiveData();
    this._dataNoRealtime = data;
    for (const worker of this._realtimeWorkers) {
      const realtime = worker.getRealtimeData();
      if (realtime != null) {
        data = applyRealtimeData(
          this._ctx.getConfig(),
          data,
          realtime,
          worker.gtfsSubfeedID,
        );
      }
    }
    this._data = data;
  }

  async getData(): Promise<GtfsData | null> {
    await Promise.all(this._realtimeWorkers.map((w) => w.prep()));
    return this._data;
  }

  getDataNoRealtime() {
    return this._dataNoRealtime;
  }
}

class GtfsRealtimeWorker {
  private _realtimeData: GtfsRealtimeData | null;
  private _dataAge: QUtcDateTime | null;
  private _pollTimer: NodeJS.Timeout | null;
  private _inactivityTimer: NodeJS.Timeout | null;

  constructor(
    private readonly _ctx: TrainQuery,
    readonly config: GtfsRealtimeConfig | null,
    private readonly _realtimeDataChanged: () => void,
    readonly gtfsSubfeedID: string | null,
  ) {
    this._realtimeData = null;
    this._dataAge = null;
    this._pollTimer = null;
    this._inactivityTimer = null;
  }

  getRealtimeData(): GtfsRealtimeData | null {
    return this._realtimeData;
  }

  async prep() {
    if (this.config == null) {
      return;
    }

    if (
      (this._realtimeData == null ||
        this._dataAge == null ||
        nowUTC().diff(this._dataAge).inSecs > this.config.staleAfter) &&
      this._pollTimer == null
    ) {
      await this._refresh();
    }

    if (this._pollTimer == null) {
      this._pollTimer = setInterval(
        () => this._refresh(),
        this.config.refreshInterval * 1000,
      );
    }

    if (this._inactivityTimer != null) {
      clearTimeout(this._inactivityTimer);
    }
    this._inactivityTimer = setTimeout(() => {
      if (this._pollTimer != null) {
        clearInterval(this._pollTimer);
      }
      this._pollTimer = null;
    }, this.config.inactivityTimeout * 1000);
  }

  private async _refresh() {
    if (this.config == null) {
      return;
    }

    this._ctx.logger.logRefreshingGtfsRealtime(this.gtfsSubfeedID);

    try {
      this._realtimeData = await fetchRealtime(this.config);
      this._dataAge = nowUTC();
      this._realtimeDataChanged();
      this._ctx.logger.logRefreshingGtfsRealtimeSuccess(this.gtfsSubfeedID);
    } catch (err) {
      this._ctx.logger.logRefreshingGtfsRealtimeFailure(
        this.gtfsSubfeedID,
        err,
      );
    }
  }
}
