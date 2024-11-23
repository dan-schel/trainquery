import { TrainQueryConfig } from "../..";

const names = {
  nodeEnv: "NODE_ENV",
  port: "PORT",
  url: "URL",
  config: "CONFIG",
  configOffline: "CONFIG_OFFLINE",
  mongoDatabaseUrl: "MONGO_DATABASE_URL",
  ptvDevId: "PTV_DEV_ID",
  ptvDevKey: "PTV_DEV_KEY",
  gtfsRealtimeKey: "GTFS_REALTIME_KEY",
  superadminUsername: "SUPERADMIN_USERNAME",
  superadminPassword: "SUPERADMIN_PASSWORD",
  relayKey: "RELAY_KEY",
};

type MongoVars = {
  databaseUrl: string;
};

type PtvVars = {
  devId: string;
  devKey: string;
};

type SuperadminVars = {
  username: string;
  password: string;
};

/** The environment variables. Use `EnvironmentVariables.get()` to access. */
export class EnvironmentVariables {
  private static _instance: EnvironmentVariables | null = null;

  static set(config: TrainQueryConfig) {
    // TODO: Remove this whole file. This is just duct tape between the new
    // "pass config in to the NPM package" way of doing things and the old
    // "load config from environment variables" way of doing things!
    this._instance = new EnvironmentVariables(
      config.devMode ? "development" : "production",
      config.port,
      config.url,
      config.config,
      null,
      config.mongoDatabaseUrl ? { databaseUrl: config.mongoDatabaseUrl } : null,
      config.ptvDevId && config.ptvDevKey
        ? { devId: config.ptvDevId, devKey: config.ptvDevKey }
        : null,
      config.gtfsRealtimeKey,
      config.superadminUsername && config.superadminPassword
        ? {
            username: config.superadminUsername,
            password: config.superadminPassword,
          }
        : null,
      config.relayKey,
    );
  }

  /** Get/create the singleton environment variables object. */
  static get() {
    if (this._instance == null) {
      throw new Error("Environment variables not set.");
    }
    return this._instance;
  }

  private constructor(
    readonly nodeEnv: string,
    readonly port: number,
    readonly url: string,
    readonly config: string,
    readonly configOffline: string | null,
    readonly mongo: MongoVars | null,
    readonly ptv: PtvVars | null,
    readonly gtfsRealtimeKey: string | null,
    readonly superadmin: SuperadminVars | null,
    readonly relayKey: string | null,
  ) {}

  isProduction() {
    return this.nodeEnv === "production";
  }
  requireConfigOffline() {
    if (this.configOffline == null) {
      throw notSet(names.configOffline);
    }
    return this.configOffline;
  }
  requireMongo() {
    if (this.mongo == null) {
      throw notSet(names.mongoDatabaseUrl);
    }
    return this.mongo;
  }
  requirePtv() {
    if (this.ptv == null) {
      throw notSet(names.ptvDevId);
    }
    return this.ptv;
  }
  requireGtfsRealtimeKey() {
    if (this.gtfsRealtimeKey == null) {
      throw notSet(names.gtfsRealtimeKey);
    }
    return this.gtfsRealtimeKey;
  }
  requireRelayKey() {
    if (this.relayKey == null) {
      throw notSet(names.relayKey);
    }
    return this.relayKey;
  }
}

/** Environment variable `name` is not set. */
function notSet(name: string) {
  return new Error(`Environment variable ${name} is not set.`);
}
