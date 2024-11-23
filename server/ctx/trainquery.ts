import { configApiHandler } from "../api/config-api";
import { FullConfig } from "../config/computed-config";
import { ServerConfig } from "../config/server-config";
import { GtfsWorker } from "../gtfs/gtfs-worker";
import { TrainQueryDB } from "./trainquery-db";
import { Banners } from "./banners";
import { loginApiHandler } from "../api/admin/login-api";
import { AdminAuth, LocalAdminAuthDB } from "../admin/auth";
import { logoutApiHandler } from "../api/admin/logout-api";
import {
  disruptionInboxApiHandler,
  disruptionInboxProcessApiHandler,
  disruptionInboxSingleApiHandler,
  disruptionRejectedApiHandler,
  disruptionRejectedRestoreApiHandler,
  disruptionRejectedSingleApiHandler,
} from "../api/admin/disruptions-api";
import { logsApiHandler } from "../api/admin/logs-api";
import { Logger } from "./logger";
import { DisruptionsManager } from "../disruptions/disruptions-manager";
import { ApiHandler } from "../api/api-handler";
import { departuresApiHandler } from "../api/departures-api";
import { gtfsApiHandler } from "../api/admin/gtfs-api";
import { Subsystems } from "../subsystem/subsystems";
import { PtvPlatformsSubsystemBuilder } from "../subsystem/ptv-platforms/ptv-platforms";

export type ServerBuilder = () => Server;
export type TrainQuery = {
  readonly instanceID: string;
  readonly isOffline: boolean;
  readonly isProduction: boolean;
  readonly getConfig: () => FullConfig;
  readonly server: Server;
  readonly database: TrainQueryDB | null;
  readonly adminAuth: AdminAuth;
  readonly disruptions: DisruptionsManager;
  readonly banners: Banners;
  gtfs: GtfsWorker | null;
  readonly logger: Logger;
  readonly subsystems: Subsystems;
};

export async function trainQuery(
  instanceID: string,
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
  const disruptions = new DisruptionsManager();
  const adminAuth = new AdminAuth(database ?? new LocalAdminAuthDB());
  const banners = new Banners();
  const subsystems = new Subsystems();

  if (config.server.ptv != null && config.server.ptv.platformsApi.length > 0) {
    subsystems.add(
      new PtvPlatformsSubsystemBuilder(config.server.ptv.platformsApi),
    );
  }

  const getConfig = () => config;

  const ctx: TrainQuery = {
    instanceID,
    isOffline,
    isProduction,
    getConfig,
    server,
    database,
    adminAuth,
    disruptions,
    banners,
    gtfs: null,
    logger,
    subsystems,
  };

  await database?.init();
  await logger.init(ctx);
  await subsystems.init(getConfig, logger, database);

  // TODO: Move all this stuff to the subsystem model.
  // <LIST OF LOOSE JUNK>
  await disruptions.init(ctx);
  await adminAuth.init();
  banners.init(ctx);

  const gtfs = ctx.getConfig().server.gtfs != null ? new GtfsWorker(ctx) : null;
  ctx.gtfs = gtfs;
  gtfs?.init();
  // </LIST OF LOOSE JUNK>

  await server.start(ctx, [
    departuresApiHandler,
    loginApiHandler,
    logoutApiHandler,
    gtfsApiHandler,
    configApiHandler,
    logsApiHandler,
    disruptionInboxApiHandler,
    disruptionInboxSingleApiHandler,
    disruptionInboxProcessApiHandler,
    disruptionRejectedApiHandler,
    disruptionRejectedSingleApiHandler,
    disruptionRejectedRestoreApiHandler,
  ]);

  logger.logServerListening(server);
  subsystems.ready(ctx);

  return ctx;
}

export type ServerParams = {
  query: Partial<Record<string, string>>;
  body: Partial<Record<string, string>>;
  header: {
    adminToken: string | null;
  };
};

export abstract class Server {
  abstract start(
    ctx: TrainQuery,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handlers: ApiHandler<any, any, any, any>[],
  ): Promise<void>;
}

export abstract class ConfigProvider {
  abstract fetchConfig(logger?: Logger): Promise<ServerConfig>;
  abstract getRefreshMs(): number | null;
}
