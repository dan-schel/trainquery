import fetch from "node-fetch";
import { ServerConfig } from "../shared/system/config";
import { ConfigProvider } from "./trainquery";
import YAML from 'yaml';
import { ZodType, z } from "zod";
import fs from "fs";
import fsp from "fs/promises";
import { uuid } from "schel-d-utils";
import path from "path";
import { FrontendOnlyConfig, ServerOnlyConfig, SharedConfig } from "../shared/system/config-elements";

const refreshMs = 1000 * 60 * 10;
const supportedVersion = "v1";

export class OnlineConfigProvider extends ConfigProvider {
  constructor(
    readonly manifestUrl: string
  ) {
    super();
    this.manifestUrl = manifestUrl;
  }

  async fetchConfig(): Promise<ServerConfig> {
    const manifestYml = await (await fetch(this.manifestUrl)).text();
    const manifest = parseYML(manifestYml, manifestJson);

    if (!(supportedVersion in manifest)) {
      throw new Error(`"${supportedVersion}" data is unavailable at "${this.manifestUrl}"`);
    }
    const zipUrl = manifest[supportedVersion].latest;

    const dataFolder = generateDataFolderPath();
    await fsp.mkdir(dataFolder);
    await download(zipUrl, path.join(dataFolder, "data.zip"));

    return new ServerConfig(
      new SharedConfig([], [], true, { offset: 0 }, []),
      new ServerOnlyConfig(),
      new FrontendOnlyConfig("", false, "", "", "")
    );
  }

  getRefreshMs(): number | null {
    return refreshMs;
  }
}

const manifestJson = z.object({}).catchall(z.object({
  latest: z.string(),
  backup: z.string().optional()
}));

async function download(url: string, destinationPath: string) {
  const response = await fetch(url);

  await new Promise<void>((resolve, reject) => {
    if (response.body == null) {
      throw new Error(`Failed to download "${url}".`);
    }

    const destination = fs.createWriteStream(destinationPath);
    destination.on("error", () => reject());

    response.body.pipe(destination);
    response.body.on("end", () => resolve());
  });
}

function parseYML<T extends ZodType>(text: string, jsonSchema: T): z.infer<T> {
  return jsonSchema.parse(YAML.parse(text));
}

function generateDataFolderPath(): string {
  return `data-${uuid()}`;
}
