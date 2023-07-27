import { ServerConfig } from "../shared/system/config";

export type ServerBuilder = (getConfig: () => ServerConfig) => Server;

export async function trainQuery(
  serverBuilder: ServerBuilder,
  configProvider: ConfigProvider
) {
  let config = await configProvider.fetchConfig();

  const refreshData = async (skipFetch: boolean) => {
    if (!skipFetch) {
      config = await configProvider.fetchConfig();
    }

    const refreshMs = configProvider.getRefreshMs();
    if (refreshMs != null) {
      setTimeout(() => refreshData(false), refreshMs);
    }
  };

  refreshData(true);

  console.log(`Loaded config (${config.shared.stops.length} stops, ${config.shared.lines.length} lines)`);

  const server = serverBuilder(() => config);
  server.start();
}

export abstract class Server {
  abstract start(): void;
}

export abstract class ConfigProvider {
  abstract fetchConfig(): Promise<ServerConfig>;
  abstract getRefreshMs(): number | null;
}
