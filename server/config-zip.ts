import AdmZip from "adm-zip";
import { ServerConfig } from "../shared/system/config";
import fsp from "fs/promises";
import path from "path";
import YAML from "yaml";
import { uuid } from "@schel-d/js-utils";
import { ZodType, z } from "zod";
import {
  FrontendOnlyConfig,
  ServerOnlyConfig,
  SharedConfig,
} from "../shared/system/config-elements";
import { LinterRules } from "../shared/system/linter-rules";
import { glob } from "glob";
import { Timetable } from "../shared/system/timetable/timetable";
import { parseTtbl } from "../shared/system/timetable/parse-ttbl";
import { Logger } from "./trainquery";

export async function loadConfigFromFiles(
  dataFolder: string,
  zipOrFolderPath: string,
  logger?: Logger
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

  const shared = await loadShared(config.shared, dataFolder);
  const server = await loadServer(config.server, dataFolder, logger);
  const frontend = await loadFrontend(config.frontend, dataFolder);

  return new ServerConfig(shared, server, frontend);
}

async function loadShared(
  input: unknown,
  dataFolder: string
): Promise<SharedConfig> {
  const schema = z
    .object({ stops: z.string(), lines: z.string(), urlNames: z.string() })
    .passthrough();

  const shared = schema.parse(input);
  const stopsYml = z.object({ stops: z.any() });
  const linesYml = z.object({ lines: z.any() });

  return SharedConfig.json.parse({
    ...shared,
    stops: (await loadYml(dataFolder, shared.stops, stopsYml)).stops,
    lines: (await loadYml(dataFolder, shared.lines, linesYml)).lines,
    urlNames: await loadYml(dataFolder, shared.urlNames, z.any()),
  });
}

async function loadServer(
  input: unknown,
  dataFolder: string,
  logger?: Logger
): Promise<ServerOnlyConfig> {
  const schema = z
    .object({
      timetables: z.string(),
      continuation: z.string(),
      linter: z.string(),
    })
    .passthrough();

  const server = schema.parse(input);
  const linter = LinterRules.json.parse(
    await loadYml(dataFolder, server.linter, z.any())
  );
  const timetables = await loadTimetables(
    dataFolder,
    server.timetables,
    (path) => logger?.logTimetableLoadFail(path)
  );

  return new ServerOnlyConfig(linter, timetables);
}

async function loadFrontend(
  input: unknown,
  dataFolder: string
): Promise<FrontendOnlyConfig> {
  const schema = z.object({ departureFeeds: z.string() }).passthrough();

  const frontend = schema.parse(input);

  return FrontendOnlyConfig.json.parse({
    ...frontend,
    departureFeeds: await loadYml(dataFolder, frontend.departureFeeds, z.any()),
  });
}

async function loadYml<T extends ZodType>(
  dataFolder: string,
  filePath: string,
  schema: T
): Promise<z.infer<T>> {
  const fullPath = path.join(dataFolder, filePath);
  const text = await fsp.readFile(fullPath, { encoding: "utf-8" });
  return schema.parse(YAML.parse(text));
}

async function loadTimetables(
  dataFolder: string,
  globString: string,
  onFail: (path: string) => void
): Promise<Timetable[]> {
  const files = await glob(globString, { cwd: dataFolder });

  const timetables: Timetable[] = [];
  for (const file of files) {
    const fullPath = path.join(dataFolder, file);
    const text = await fsp.readFile(fullPath, { encoding: "utf-8" });
    const timetable = parseTtbl(text);

    if (timetable == null) {
      onFail(file);
    } else {
      timetables.push(timetable);
    }
  }

  return timetables;
}

async function extractZip(zip: AdmZip, location: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    zip.extractAllToAsync(location, true, false, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function generateDataFolderPath(): string {
  return `data-${uuid()}`;
}
