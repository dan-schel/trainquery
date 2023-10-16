import path from "path";
// import fsp from "fs/promises";
// import { download, extractZip, generateDataFolderPath } from "../config/download-utils";
import { TrainQuery } from "../trainquery";
import { GtfsData } from "./gtfs-data";
import { GtfsConfig } from "../config/gtfs-config";
import { parseGtfsFiles } from "./parse-gtfs-files";
// import AdmZip from "adm-zip";

export class GtfsWorker {
  private _data: GtfsData | null;
  private _gtfsConfig: GtfsConfig;

  constructor(
    private readonly _ctx: TrainQuery
  ) {
    this._data = null;
    const gtfsConfig = this._ctx.getConfig().server.gtfs;
    if (gtfsConfig == null) {
      throw new Error("Cannot create GTFS worker. No GTFS config provided.");
    }
    this._gtfsConfig = gtfsConfig;
  }

  init() {
    downloadGtfs(this._gtfsConfig).then(data => {
      this._data = data;
      this._ctx.logger.logGtfsReady();
    }).catch(err => {
      this._ctx.logger.logGtfsDownloadError(err);
    });
  }
}

async function downloadGtfs(gtfsConfig: GtfsConfig): Promise<GtfsData> {
  const dataFolder = "offline/gtfs-temporary"; // generateDataFolderPath();
  // const zipPath = path.join(dataFolder, "gtfs.zip");
  // await fsp.mkdir(dataFolder);
  // await download(gtfsConfig.staticUrl, zipPath);

  // const zip = new AdmZip(zipPath);
  // await extractZip(zip, dataFolder);

  if (gtfsConfig.subfeeds != null) {
    const parsedFeeds: GtfsData[] = [];
    for (const subfeed of gtfsConfig.subfeeds) {
      // const subzipPath = path.join(dataFolder, subfeed);
      // const subzip = new AdmZip(subzipPath);
      const subfeedDirectory = path.join(dataFolder, path.dirname(subfeed));
      // await extractZip(subzip, subfeedDirectory);

      const data = await parseGtfsFiles(subfeedDirectory);
      parsedFeeds.push(data);
    }

    return GtfsData.merge(parsedFeeds);
  }
  else {
    const data = await parseGtfsFiles(dataFolder);
    return data;
  }
}
