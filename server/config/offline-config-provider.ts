import { ConfigProvider, Logger } from "../trainquery";
import fsp from "fs/promises";
import { generateDataFolderPath, loadConfigFromFiles } from "./config-zip";
import { ServerConfig } from "./server-config";

export class OfflineConfigProvider extends ConfigProvider {
  constructor(
    readonly zipOrFolderPath: string,

    /**
     * The value to use for the canonical url in the config. Provided by an
     * environment variable.
     */
    readonly canonicalUrl: string
  ) {
    super();
  }

  async fetchConfig(logger?: Logger): Promise<ServerConfig> {
    const dataFolder = generateDataFolderPath();
    await fsp.mkdir(dataFolder);

    const config = await loadConfigFromFiles(
      dataFolder,
      this.zipOrFolderPath,
      this.canonicalUrl,
      logger
    );

    await fsp.rm(dataFolder, {
      recursive: true,
      force: true,
      retryDelay: 100,
      maxRetries: 5,
    });

    return config;
  }

  getRefreshMs(): number | null {
    return null;
  }
}
