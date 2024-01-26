import AdmZip from "adm-zip";
import path from "path";
import fsp from "fs/promises";
import {
  generateDataFolderPath,
  download,
  extractZip,
  deleteDataFolder,
} from "../config/download-utils";
import { GtfsConfig } from "../config/gtfs-config";
import { TrainQuery } from "../trainquery";
import { GtfsData } from "./data/gtfs-data";
import { parseGtfsFiles } from "./parse-gtfs-files";

export async function downloadGtfs(
  ctx: TrainQuery,
  gtfsConfig: GtfsConfig<true> | GtfsConfig<false>,
): Promise<GtfsData> {
  const dataFolder = generateDataFolderPath();

  const zipPath = gtfsConfig.isOnlineSource()
    ? path.join(dataFolder, "gtfs.zip")
    : gtfsConfig.staticData;

  await fsp.mkdir(dataFolder);

  if (gtfsConfig.isOnlineSource()) {
    await download(gtfsConfig.staticData, zipPath);
  }

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

      const data = await parseGtfsFiles(ctx, subfeedDirectory, subfeed);
      parsedFeeds.push(data);
    }

    await deleteDataFolder(dataFolder);
    return GtfsData.merge(
      parsedFeeds,
      gtfsConfig.subfeeds.map((f) => f.name),
    );
  } else {
    const data = await parseGtfsFiles(ctx, dataFolder, gtfsConfig.feed);
    await deleteDataFolder(dataFolder);
    return data;
  }
}
