import { ConfigProvider, Logger } from "../trainquery";
import fsp from "fs/promises";
import { loadConfigFromFiles } from "./config-zip";
import { ServerConfig } from "./server-config";
import { deleteDataFolder, generateDataFolderPath } from "./download-utils";

export class OfflineConfigProvider extends ConfigProvider {
  constructor(
    readonly zipOrFolderPath: string,

    /**
     * The value to use for the canonical url in the config. Provided by an
     * environment variable.
     */
    readonly canonicalUrl: string,
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
      logger,
    );

    await deleteDataFolder(dataFolder);

    return config;
  }

  getRefreshMs(): number | null {
    return null;
  }
}
