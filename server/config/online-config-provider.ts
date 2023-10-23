import fetch from "node-fetch";
import { ConfigProvider, Logger } from "../trainquery";
import YAML from "yaml";
import { z } from "zod";
import fsp from "fs/promises";
import path from "path";
import { loadConfigFromFiles } from "./config-zip";
import { ServerConfig } from "./server-config";
import {
  deleteDataFolder,
  download,
  generateDataFolderPath,
} from "./download-utils";

const refreshMs = 1000 * 60 * 10;
const supportedVersion = "v1";

export class OnlineConfigProvider extends ConfigProvider {
  constructor(
    /** Either the url to a manifest file (.yml) or config zip file. */
    readonly url: string,
    /**
     * The value to use for the canonical url in the config. Provided by an
     * environment variable.
     */
    readonly canonicalUrl: string,
  ) {
    super();
  }

  async fetchConfig(logger?: Logger): Promise<ServerConfig> {
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
          `"${supportedVersion}" data is unavailable at "${this.url}"`,
        );
      }
      return manifest[supportedVersion].latest;
    })();

    const dataFolder = generateDataFolderPath();
    const zipPath = path.join(dataFolder, "data.zip");
    await fsp.mkdir(dataFolder);
    await download(zipUrl, zipPath);

    const config = await loadConfigFromFiles(
      dataFolder,
      zipPath,
      this.canonicalUrl,
      logger,
    );

    await deleteDataFolder(dataFolder);

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
  }),
);
