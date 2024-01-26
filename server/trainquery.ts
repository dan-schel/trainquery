import { configApi } from "./api/config-api";
import { departuresApi } from "./api/departures-api";
import { ssrAppPropsApi, ssrRoutePropsApi } from "./api/ssr-props-api";
import { FullConfig } from "./config/computed-config";
import { ServerConfig } from "./config/server-config";
import { Disruptions } from "./disruptions/disruptions";
import { GtfsWorker } from "./gtfs/gtfs-worker";
import { BadApiCallError } from "./param-utils";
import { TrainQueryDB } from "./trainquery-db";

export type ServerBuilder = () => Server;
export type TrainQuery = {
  readonly isOffline: boolean;
  readonly isProduction: boolean;
  readonly getConfig: () => FullConfig;
  readonly server: Server;
  readonly database: TrainQueryDB | null;
  readonly disruptions: Disruptions;
  gtfs: GtfsWorker | null;
  readonly logger: Logger;
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
      try {
        config = new FullConfig(await configProvider.fetchConfig(logger));
        logger.logConfigRefresh(config, false);
      } catch (err) {
        logger.logConfigRefreshFailure(err);
      }
    }

    const refreshMs = configProvider.getRefreshMs();
    if (refreshMs != null) {
      setTimeout(() => refreshConfig(false), refreshMs);
    }
  };
  refreshConfig(true);

  const server = serverBuilder();

  const disruptions = new Disruptions();

  const ctx: TrainQuery = {
    getConfig: () => config,
    server,
    database,
    logger,
    gtfs: null,
    disruptions,
    isOffline,
    isProduction,
  };

  await database?.init();
  await disruptions.init(ctx);

  const gtfs = ctx.getConfig().server.gtfs != null ? new GtfsWorker(ctx) : null;
  ctx.gtfs = gtfs;
  gtfs?.init();

  await server.start(ctx, async (endpoint: string, params: ServerParams) => {
    if (endpoint === "ssrAppProps") {
      return await ssrAppPropsApi(ctx);
    }
    if (endpoint === "ssrRouteProps") {
      return await ssrRoutePropsApi(ctx, params);
    }
    if (endpoint === "config") {
      return await configApi(ctx);
    }
    if (endpoint === "departures") {
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
  abstract logConfigRefreshFailure(err: unknown): void;
  abstract logTimetableLoadFail(path: string): void;

  abstract logRecallingGtfs(): void;
  abstract logRecallingGtfsSuccess(): void;
  abstract logRecallingGtfsEmpty(): void;
  abstract logRecallingGtfsFailure(err: unknown): void;
  abstract logRefreshingGtfs(): void;
  abstract logRefreshingGtfsSuccess(): void;
  abstract logRefreshingGtfsFailure(err: unknown): void;
  abstract logPersistingGtfs(): void;
  abstract logPersistingGtfsSuccess(): void;
  abstract logPersistingGtfsFailure(err: unknown): void;
  abstract logRefreshingGtfsRealtime(): void;
  abstract logRefreshingGtfsRealtimeSuccess(): void;
  abstract logRefreshingGtfsRealtimeFailure(err: unknown): void;
  abstract logRefreshingGtfsRealtimeCancelled(): void;

  abstract logFetchingDisruptions(source: string): void;
  abstract logFetchingDisruptionsSuccess(source: string, count: number): void;
  abstract logFetchingDisruptionsFailure(source: string, err: unknown): void;
}

function hashify(ctx: TrainQuery, result: object) {
  return {
    hash: ctx.getConfig().hash,
    result: result,
  };
}
