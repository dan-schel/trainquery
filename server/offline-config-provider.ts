import { ServerConfig } from "../shared/system/config";
import { ConfigProvider } from "./trainquery";
import fsp from "fs/promises";
import { generateDataFolderPath, loadConfigFromZip } from "./config-zip";

export class OfflineConfigProvider extends ConfigProvider {
  constructor(readonly zipPath: string) {
    super();
  }

  async fetchConfig(): Promise<ServerConfig> {
    const dataFolder = generateDataFolderPath();
    await fsp.mkdir(dataFolder);

    const config = await loadConfigFromZip(dataFolder, this.zipPath);

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
