import { TrainQuery } from "../trainquery";
import { GtfsData } from "./data/gtfs-data";
import { GtfsConfig, GtfsFeedConfig } from "../config/gtfs-config";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { nowUTCLuxon } from "../../shared/qtime/luxon-conversions";
import { QTime } from "../../shared/qtime/qtime";
import { downloadGtfs } from "./fetch";
import { fetchRealtime } from "./realtime/fetch";
import { applyRealtimeData } from "./realtime/apply-realtime-data";

// How often to CHECK if the data is outdated. We should check far more often
// than the refresh interval itself because when the data is pulled from the
// database it could be any age!
const checkOutdatedInterval = 10 * 60 * 1000;

export class GtfsWorker {
  private _data: GtfsData | null;
  private readonly _gtfsConfig: GtfsConfig<true> | GtfsConfig<false>;
  private _lastAttempt: QUtcDateTime | null;

  constructor(private readonly _ctx: TrainQuery) {
    this._data = null;
    this._lastAttempt = null;
    const gtfsConfig = this._ctx.getConfig().server.gtfs;
    if (gtfsConfig == null) {
      throw new Error("Cannot create GTFS worker. No GTFS config provided.");
    }
    this._gtfsConfig = gtfsConfig;
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

        const now = nowUTCLuxon();
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

      // Finally, start polling for realtime updates if appropriate.
      if (!this._ctx.isOffline) {
        this._initRealtime();
      }
    })();
  }

  private _initRealtime() {
    const init = (feed: GtfsFeedConfig, gtfsSubfeedID: string | null) => {
      const realtimeConfig = feed.realtime;
      if (realtimeConfig == null) {
        return;
      }

      const refresh = async () => {
        this._ctx.logger.logRefreshingGtfsRealtime();
        const schedule = this._data;
        if (schedule == null) {
          this._ctx.logger.logRefreshingGtfsRealtimeCancelled();
          return;
        }

        try {
          const realtimeData = await fetchRealtime();
          this._data = applyRealtimeData(
            this._ctx.getConfig(),
            schedule,
            realtimeData,
            gtfsSubfeedID,
          );
          this._ctx.logger.logRefreshingGtfsRealtimeSuccess();
        } catch (err) {
          this._ctx.logger.logRefreshingGtfsRealtimeFailure(err);
        }
      };
      refresh();
      setInterval(refresh, realtimeConfig.refreshSeconds * 1000);
    };

    if (this._gtfsConfig.usesSubfeeds) {
      this._gtfsConfig.subfeeds.forEach((x) => init(x, x.name));
    } else {
      init(this._gtfsConfig.feed, null);
    }
  }

  private async _refresh() {
    this._lastAttempt = nowUTCLuxon();

    try {
      this._ctx.logger.logRefreshingGtfs();
      const data = await downloadGtfs(this._ctx, this._gtfsConfig);
      this._data = data;
      this._ctx.logger.logRefreshingGtfsSuccess();
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

  get data() {
    return this._data;
  }
}
