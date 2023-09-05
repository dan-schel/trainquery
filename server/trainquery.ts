import { ServerConfig } from "../shared/system/config";
import { configApi } from "./config-api";
import { ssrAppPropsApi, ssrRoutePropsApi } from "./ssr-props-api";

export type ServerBuilder = () => Server;
export type TrainQuery = { getConfig: () => ServerConfig; server: Server };

export async function trainQuery(
  serverBuilder: ServerBuilder,
  configProvider: ConfigProvider,
  logger: Logger
) {
  let config = await configProvider.fetchConfig(logger);
  logger.logConfigRefresh(config, true);

  const refreshConfig = async (skipFetch: boolean) => {
    if (!skipFetch) {
      config = await configProvider.fetchConfig(logger);
      logger.logConfigRefresh(config, false);
    }

    const refreshMs = configProvider.getRefreshMs();
    if (refreshMs != null) {
      setTimeout(() => refreshConfig(false), refreshMs);
    }
  };
  refreshConfig(true);

  const server = serverBuilder();

  const ctx: TrainQuery = {
    getConfig: () => config,
    server: server,
  };

  await server.start(ctx, async (endpoint: string, params: ServerParams) => {
    if (endpoint == "ssrAppProps") {
      return await ssrAppPropsApi(ctx);
    }
    if (endpoint == "ssrRouteProps") {
      return await ssrRoutePropsApi(ctx, params);
    }
    if (endpoint == "config") {
      return await configApi(ctx);
    }
    return null;
  });
  logger.logListening(server);
  return ctx;
}

export type ServerParams = Record<string, string>;

export abstract class Server {
  abstract start(
    ctx: TrainQuery,
    requestListener: (
      endpoint: string,
      params: ServerParams
    ) => Promise<unknown>
  ): Promise<void>;
}

export abstract class ConfigProvider {
  abstract fetchConfig(logger: Logger): Promise<ServerConfig>;
  abstract getRefreshMs(): number | null;
}

export abstract class Logger {
  abstract logListening(server: Server): void;
  abstract logConfigRefresh(config: ServerConfig, initial: boolean): void;
  abstract logTimetableLoadFail(path: string): void;
}
