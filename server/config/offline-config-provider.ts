import { ConfigProvider, Logger } from "../trainquery";
import fsp from "fs/promises";
import { generateDataFolderPath, loadConfigFromFiles } from "./config-zip";
import { ServerConfig } from "./server-config";

export class OfflineConfigProvider extends ConfigProvider {
  constructor(readonly zipOrFolderPath: string) {
    super();
  }

  async fetchConfig(logger?: Logger): Promise<ServerConfig> {
    const dataFolder = generateDataFolderPath();
    await fsp.mkdir(dataFolder);

    const config = await loadConfigFromFiles(
      dataFolder,
      this.zipOrFolderPath,
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
