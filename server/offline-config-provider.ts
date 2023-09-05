import { ServerConfig } from "../shared/system/config";
import { ConfigProvider, Logger } from "./trainquery";
import fsp from "fs/promises";
import { generateDataFolderPath, loadConfigFromZip } from "./config-zip";

export class OfflineConfigProvider extends ConfigProvider {
  constructor(readonly zipPath: string) {
    super();
  }

  async fetchConfig(logger: Logger): Promise<ServerConfig> {
    const dataFolder = generateDataFolderPath();
    await fsp.mkdir(dataFolder);

    const config = await loadConfigFromZip(dataFolder, this.zipPath, logger);

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
