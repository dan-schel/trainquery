import { ServerConfig } from "../shared/system/config";

export type ServerBuilder = () => Server;

export async function trainQuery(
  serverBuilder: ServerBuilder,
  configProvider: ConfigProvider,
  logger: Logger
) {
  let config = await configProvider.fetchConfig();
  logger.logConfigRefresh(config, true);

  const refreshData = async (skipFetch: boolean) => {
    if (!skipFetch) {
      config = await configProvider.fetchConfig();
      logger.logConfigRefresh(config, false);
    }

    const refreshMs = configProvider.getRefreshMs();
    if (refreshMs != null) {
      setTimeout(() => refreshData(false), refreshMs);
    }
  };
  refreshData(true);

  const server = serverBuilder();
  await server.start();
  logger.logListening(server);
}

export abstract class Server {
  abstract start(): Promise<void>;
}

export abstract class ConfigProvider {
  abstract fetchConfig(): Promise<ServerConfig>;
  abstract getRefreshMs(): number | null;
}

export abstract class Logger {
  abstract logListening(server: Server): void;
  abstract logConfigRefresh(config: ServerConfig, initial: boolean): void;
}
