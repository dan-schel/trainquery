import fetch from "node-fetch";
import { ServerConfig } from "../shared/system/config";
import { ConfigProvider } from "./trainquery";
import YAML from "yaml";
import { z } from "zod";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { generateDataFolderPath, loadConfigFromZip } from "./config-zip";

const refreshMs = 1000 * 60 * 10;
const supportedVersion = "v1";

export class OnlineConfigProvider extends ConfigProvider {
  constructor(
    /** Either the url to a manifest file (.yml) or config zip file. */
    readonly url: string
  ) {
    super();
  }

  async fetchConfig(): Promise<ServerConfig> {
    const zipUrl = await (async () => {
      // This URL might be the zip file...
      if (this.url.endsWith(".zip")) {
        return this.url;
      }

      // ...otherwise it's the manifest file.
      const manifestYml = await (await fetch(this.url)).text();
      const manifest = manifestJson.parse(YAML.parse(manifestYml));

      if (!(supportedVersion in manifest)) {
        throw new Error(
          `"${supportedVersion}" data is unavailable at "${this.url}"`
        );
      }
      return manifest[supportedVersion].latest;
    })();

    const dataFolder = generateDataFolderPath();
    const zipPath = path.join(dataFolder, "data.zip");
    await fsp.mkdir(dataFolder);
    await download(zipUrl, zipPath);

    const config = await loadConfigFromZip(dataFolder, zipPath);

    await fsp.rm(dataFolder, {
      recursive: true,
      force: true,
      retryDelay: 100,
      maxRetries: 5,
    });

    return config;
  }

  getRefreshMs(): number | null {
    return refreshMs;
  }
}

const manifestJson = z.object({}).catchall(
  z.object({
    latest: z.string(),
    backup: z.string().optional(),
  })
);

async function download(url: string, destinationPath: string) {
  const response = await fetch(url);

  await new Promise<void>((resolve, reject) => {
    if (response.body == null) {
      throw new Error(`Failed to download "${url}".`);
    }

    const destination = fs.createWriteStream(destinationPath);

    response.body.pipe(destination);
    response.body.on("error", () => reject());
    destination.on("error", () => reject());
    destination.on("finish", resolve);
  });
}
