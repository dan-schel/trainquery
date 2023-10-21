import { configApi } from "./api/config-api";
import { departuresApi } from "./api/departures-api";
import { ssrAppPropsApi, ssrRoutePropsApi } from "./api/ssr-props-api";
import { FullConfig } from "./config/computed-config";
import { ServerConfig } from "./config/server-config";
import { GtfsWorker } from "./gtfs/gtfs-worker";
import { BadApiCallError } from "./param-utils";
import { TrainQueryDB } from "./trainquery-db";

export type ServerBuilder = () => Server;
export type TrainQuery = {
  readonly getConfig: () => FullConfig;
  readonly server: Server;
  readonly logger: Logger;
  readonly database: TrainQueryDB | null;
  readonly isOffline: boolean;
  readonly isProduction: boolean;
  gtfs: GtfsWorker | null;
};

export async function trainQuery(
  serverBuilder: ServerBuilder,
  configProvider: ConfigProvider,
  database: TrainQueryDB | null,
  logger: Logger,
  isOffline: boolean,
  isProduction: boolean,
) {
  let config = new FullConfig(await configProvider.fetchConfig(logger));
  logger.logConfigRefresh(config, true);

  const refreshConfig = async (skipFetch: boolean) => {
    if (!skipFetch) {
      config = new FullConfig(await configProvider.fetchConfig(logger));
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
    server,
    database,
    logger,
    gtfs: null,
    isOffline,
    isProduction,
  };

  await database?.init();

  const gtfs = ctx.getConfig().server.gtfs != null ? new GtfsWorker(ctx) : null;
  ctx.gtfs = gtfs;
  gtfs?.init();

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
    if (endpoint == "departures") {
      return hashify(ctx, await departuresApi(ctx, params));
    }
    throw new BadApiCallError(`"${endpoint}" API does not exist.`, 404);
  });
  logger.logServerListening(server);

  return ctx;
}

export type ServerParams = Record<string, string>;

export abstract class Server {
  abstract start(
    ctx: TrainQuery,
    requestListener: (
      endpoint: string,
      params: ServerParams,
    ) => Promise<object>,
  ): Promise<void>;
}

export abstract class ConfigProvider {
  abstract fetchConfig(logger?: Logger): Promise<ServerConfig>;
  abstract getRefreshMs(): number | null;
}

export abstract class Logger {
  abstract logServerListening(server: Server): void;
  abstract logConfigRefresh(config: FullConfig, initial: boolean): void;
  abstract logTimetableLoadFail(path: string): void;

  abstract logRecallingGtfs(): void;
  abstract logRecallingGtfsSuccess(): void;
  abstract logRecallingGtfsEmpty(): void;
  abstract logRecallingGtfsFailure(err: unknown): void;
  abstract logDownloadingGtfs(): void;
  abstract logDownloadingGtfsSuccess(): void;
  abstract logDownloadingGtfsFailure(err: unknown): void;
  abstract logPersistingGtfs(): void;
  abstract logPersistingGtfsSuccess(): void;
  abstract logPersistingGtfsFailure(err: unknown): void;
}

function hashify(ctx: TrainQuery, result: object) {
  return {
    hash: ctx.getConfig().hash,
    result: result,
  };
}
