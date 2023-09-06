import { parseIntNull } from "@schel-d/js-utils/dist/types";
import { ServerConfig } from "../shared/system/config";
import { configApi } from "./api/config-api";
import { departuresApi } from "./api/departures-api";
import { ssrAppPropsApi, ssrRoutePropsApi } from "./api/ssr-props-api";
import { StopID, isStopID } from "../shared/system/ids";
import { getStop } from "../shared/system/config-utils";
import { Stop } from "../shared/system/stop";

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
    if (endpoint == "departures") {
      return await departuresApi(ctx, params);
    }
    throw new BadApiCallError(`"${endpoint}" API does not exist.`, 404);
  });
  logger.logListening(server);
  return ctx;
}

export type ServerParams = Record<string, string>;

export abstract class Server {
  abstract start(
    ctx: TrainQuery,
    requestListener: (endpoint: string, params: ServerParams) => Promise<object>
  ): Promise<void>;
}

export abstract class ConfigProvider {
  abstract fetchConfig(logger?: Logger): Promise<ServerConfig>;
  abstract getRefreshMs(): number | null;
}

export abstract class Logger {
  abstract logListening(server: Server): void;
  abstract logConfigRefresh(config: ServerConfig, initial: boolean): void;
  abstract logTimetableLoadFail(path: string): void;
}

export class BadApiCallError extends Error {
  readonly type = "bad-api-call";
  constructor(message: string, readonly statusCode = 400) {
    super(message);
  }
  static detect(error: unknown): error is BadApiCallError {
    return (
      error != null &&
      typeof error == "object" &&
      "type" in error &&
      error.type == "bad-api-call"
    );
  }
}

export function requireParam(params: ServerParams, name: string): string {
  const value = params["name"];
  if (value == null) {
    throw new BadApiCallError(`"${name}" param is required.`);
  }
  return value;
}

export function requireStopIDParam(params: ServerParams, name: string): StopID {
  const value = requireParam(params, name);
  const num = parseIntNull(value);
  if (num == null || !isStopID(num)) {
    throw new BadApiCallError(`"${name}" param should be a stop ID.`);
  }
  return num;
}

export function requireStopParam(
  ctx: TrainQuery,
  params: ServerParams,
  name: string
): Stop {
  const id = requireStopIDParam(params, name);
  const stop = getStop(ctx.getConfig(), id);
  if (stop == null) {
    throw new BadApiCallError(`Stop ${id} does not exist.`);
  }
  return stop;
}
