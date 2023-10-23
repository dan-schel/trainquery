import path from "path";
import fsp from "fs/promises";
import {
  deleteDataFolder,
  download,
  extractZip,
  generateDataFolderPath,
} from "../config/download-utils";
import { TrainQuery } from "../trainquery";
import { GtfsData } from "./gtfs-data";
import { GtfsConfig } from "../config/gtfs-config";
import { parseGtfsFiles } from "./parse-gtfs-files";
import AdmZip from "adm-zip";

// How often to CHECK if the data is outdated. We should check far more often
// than the refresh interval itself because when the data is pulled from the
// database it could be any age!
const checkOutdatedInterval = 10 * 60 * 1000;

export class GtfsWorker {
  private _data: GtfsData | null;
  private readonly _gtfsConfig: GtfsConfig<true> | GtfsConfig<false>;

  constructor(private readonly _ctx: TrainQuery) {
    this._data = null;
    const gtfsConfig = this._ctx.getConfig().server.gtfs;
    if (gtfsConfig == null) {
      throw new Error("Cannot create GTFS worker. No GTFS config provided.");
    }
    this._gtfsConfig = gtfsConfig;
  }

  init() {
    if (this._ctx.isOffline) {
      return;
    }

    (async () => {
      // First, attempt to retrieve the saved GTFS data from the database.
      if (this._gtfsConfig.persist && this._ctx.database != null) {
        try {
          this._ctx.logger.logRecallingGtfs();
          this._data = await this._ctx.database.fetchGtfs();
          if (this._data != null) {
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
      const refreshSeconds = this._gtfsConfig.refreshSeconds;
      const refreshIfNeeded = () => {
        if (
          this._ctx.isProduction &&
          (this._data == null || this._data.isOld(refreshSeconds))
        ) {
          this._refresh();
        }
      };
      refreshIfNeeded();
      setTimeout(refreshIfNeeded, checkOutdatedInterval);
    })();
  }

  private async _refresh() {
    try {
      this._ctx.logger.logDownloadingGtfs();
      const data = await downloadGtfs(this._ctx, this._gtfsConfig);
      this._data = data;
      this._ctx.logger.logDownloadingGtfsSuccess();
    } catch (err) {
      this._ctx.logger.logDownloadingGtfsFailure(err);
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

async function downloadGtfs(
  ctx: TrainQuery,
  gtfsConfig: GtfsConfig<true> | GtfsConfig<false>,
): Promise<GtfsData> {
  const dataFolder = generateDataFolderPath();
  const zipPath = path.join(dataFolder, "gtfs.zip");
  await fsp.mkdir(dataFolder);
  await download(gtfsConfig.staticUrl, zipPath);

  const zip = new AdmZip(zipPath);
  await extractZip(zip, dataFolder);

  if (gtfsConfig.usesSubfeeds) {
    const parsedFeeds: GtfsData[] = [];
    for (const subfeed of gtfsConfig.subfeeds) {
      const subzipPath = path.join(dataFolder, subfeed.path);
      const subzip = new AdmZip(subzipPath);
      const subfeedDirectory = path.join(
        dataFolder,
        path.dirname(subfeed.path),
      );
      await extractZip(subzip, subfeedDirectory);

      const data = await parseGtfsFiles(ctx, subfeedDirectory, subfeed.stops);
      parsedFeeds.push(data);
    }

    await deleteDataFolder(dataFolder);
    return GtfsData.merge(
      parsedFeeds,
      gtfsConfig.subfeeds.map((f) => f.name),
    );
  } else {
    const data = await parseGtfsFiles(ctx, dataFolder, gtfsConfig.feed.stops);
    await deleteDataFolder(dataFolder);
    return data;
  }
}
