import AdmZip from "adm-zip";
import fsp from "fs/promises";
import path from "path";
import YAML from "yaml";
import { ZodType, z } from "zod";
import { LinterRules } from "../../shared/system/linter-rules";
import { glob } from "glob";
import { Timetable } from "../../shared/system/timetable/timetable";
import { parseTtbl } from "../../shared/system/timetable/parse-ttbl";
import { parseTtblV3Compat } from "../../shared/system/timetable/parse-ttbl-v3-compat";
import { Logger } from "../ctx/trainquery";
import { ServerConfig } from "./server-config";
import { FrontendOnlyConfig } from "../../shared/system/config/frontend-only-config";
import { SharedConfig } from "../../shared/system/config/shared-config";
import { ServerOnlyConfig } from "./server-only-config";
import { PlatformRules } from "./platform-rules";
import { GtfsConfig } from "./gtfs-config";
import { extractZip } from "./download-utils";
import { PtvConfig } from "./ptv-config";
import { BannersConfig } from "./banners-config";
import { LegalConfig } from "../../shared/system/config/legal-config";

export async function loadConfigFromFiles(
  dataFolder: string,
  zipOrFolderPath: string,
  canonicalUrl: string,
  logger?: Logger,
): Promise<ServerConfig> {
  const isDirectory = (await fsp.lstat(zipOrFolderPath)).isDirectory();
  if (isDirectory) {
    await fsp.cp(zipOrFolderPath, dataFolder, { recursive: true });
  } else {
    const zip = new AdmZip(zipOrFolderPath);
    await extractZip(zip, dataFolder);
  }

  const configSchema = z.object({
    shared: z.any(),
    server: z.any(),
    frontend: z.any(),
  });
  const config = await loadYml(dataFolder, "config.yml", configSchema);

  const shared = await loadShared(config.shared, dataFolder, canonicalUrl);
  const server = await loadServer(config.server, dataFolder, logger);
  const frontend = await loadFrontend(config.frontend, dataFolder);

  return new ServerConfig(shared, server, frontend);
}

async function loadShared(
  input: unknown,
  dataFolder: string,
  canonicalUrl: string,
): Promise<SharedConfig> {
  const schema = z
    .object({
      stops: z.string(),
      lines: z.string(),
      urlNames: z.string(),
      continuation: z.string().optional(),
    })
    .passthrough();

  const shared = schema.parse(input);
  const stopsYml = z.object({ stops: z.any() });
  const linesYml = z.object({ lines: z.any() });
  const continuationYml = z.object({ rules: z.any() });

  return SharedConfig.json.parse({
    ...shared,
    stops: (await loadYml(dataFolder, shared.stops, stopsYml)).stops,
    lines: (await loadYml(dataFolder, shared.lines, linesYml)).lines,
    urlNames: await loadYml(dataFolder, shared.urlNames, z.any()),
    continuationRules:
      shared.continuation == null
        ? undefined
        : (await loadYml(dataFolder, shared.continuation, continuationYml))
            .rules,
    canonicalUrl: canonicalUrl,
  });
}

async function loadServer(
  input: unknown,
  dataFolder: string,
  logger?: Logger,
): Promise<ServerOnlyConfig> {
  const schema = z
    .object({
      timetables: z.string(),
      platformRules: z.string(),
      gtfs: z.string().optional(),
      ptv: z.string().optional(),
      banners: z.string().optional(),
      linter: z.string(),
      about: z.string(),
      legal: z.string().optional(),
    })
    .passthrough();

  const server = schema.parse(input);
  const timetables = await loadTimetables(
    dataFolder,
    server.timetables,
    (path) => logger?.logTimetableLoadFail(path),
  );
  const platformRules = PlatformRules.json.parse(
    await loadYml(dataFolder, server.platformRules, z.any()),
  );
  const gtfs =
    server.gtfs != null
      ? GtfsConfig.json.parse(await loadYml(dataFolder, server.gtfs, z.any()))
      : null;
  const ptv =
    server.ptv != null
      ? PtvConfig.json.parse(await loadYml(dataFolder, server.ptv, z.any()))
      : null;
  const banners =
    server.banners != null
      ? BannersConfig.json.parse(
          await loadYml(dataFolder, server.banners, z.any()),
        )
      : BannersConfig.default;
  const linter = LinterRules.json.parse(
    await loadYml(dataFolder, server.linter, z.any()),
  );
  const about = await loadText(dataFolder, server.about);
  const legal =
    server.legal != null
      ? LegalConfig.json.parse(await loadYml(dataFolder, server.legal, z.any()))
      : LegalConfig.default;

  return new ServerOnlyConfig(
    timetables,
    platformRules,
    gtfs,
    ptv,
    banners,
    linter,
    about,
    legal,
  );
}

async function loadFrontend(
  input: unknown,
  dataFolder: string,
): Promise<FrontendOnlyConfig> {
  const schema = z.object({ departureFeeds: z.string() }).passthrough();

  const frontend = schema.parse(input);

  return FrontendOnlyConfig.json.parse({
    ...frontend,
    departureFeeds: await loadYml(dataFolder, frontend.departureFeeds, z.any()),
  });
}

async function loadText(dataFolder: string, filePath: string) {
  const fullPath = path.join(dataFolder, filePath);
  const text = await fsp.readFile(fullPath, { encoding: "utf-8" });
  return text;
}

async function loadYml<T extends ZodType>(
  dataFolder: string,
  filePath: string,
  schema: T,
): Promise<z.infer<T>> {
  const fullPath = path.join(dataFolder, filePath);
  const text = await fsp.readFile(fullPath, { encoding: "utf-8" });
  return schema.parse(YAML.parse(text));
}

async function loadTimetables(
  dataFolder: string,
  globString: string,
  onFail: (path: string) => void,
): Promise<Timetable[]> {
  const files = await glob(globString, { cwd: dataFolder });

  const timetables: Timetable[] = [];
  for (const file of files) {
    const fullPath = path.join(dataFolder, file);
    const text = await fsp.readFile(fullPath, { encoding: "utf-8" });
    const timetable = parseTtbl(text) ?? parseTtblV3Compat(text);

    if (timetable == null) {
      onFail(file);
    } else {
      timetables.push(timetable);
    }
  }

  return timetables;
}
