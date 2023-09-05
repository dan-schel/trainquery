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

export async function loadConfigFromZip(
  dataFolder: string,
  zipPath: string
): Promise<ServerConfig> {
  const zip = new AdmZip(zipPath);
  await extractZip(zip, dataFolder);

  const configSchema = z.object({
    shared: z.any(),
    server: z.any(),
    frontend: z.any(),
  });
  const config = await loadYml(dataFolder, "config.yml", configSchema);

  const shared = await loadShared(config.shared, dataFolder);
  const server = await loadServer(config.server, dataFolder);
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
  dataFolder: string
): Promise<ServerOnlyConfig> {
  const schema = z
    .object({ continuation: z.string(), linter: z.string() })
    .passthrough();

  const server = schema.parse(input);
  const linter = LinterRules.json.parse(
    await loadYml(dataFolder, server.linter, z.any())
  );
  return new ServerOnlyConfig(linter);
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
