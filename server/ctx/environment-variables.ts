import { parseIntNull } from "@dan-schel/js-utils";

const names = {
  nodeEnv: "NODE_ENV",
  port: "PORT",
  url: "URL",
  config: "CONFIG",
  configOffline: "CONFIG_OFFLINE",
  mongoDomain: "MONGO_DOMAIN",
  mongoUsername: "MONGO_USERNAME",
  mongoPassword: "MONGO_PASSWORD",
  ptvDevId: "PTV_DEV_ID",
  ptvDevKey: "PTV_DEV_KEY",
  gtfsRealtimeKey: "GTFS_REALTIME_KEY",
  superadminUsername: "SUPERADMIN_USERNAME",
  superadminPassword: "SUPERADMIN_PASSWORD",
  relayKey: "RELAY_KEY",
};

const defaults = {
  nodeEnv: "development",
  port: "3000",
};

type MongoVars = {
  domain: string;
  username: string;
  password: string;
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

  /** Get/create the singleton environment variables object. */
  static get() {
    if (this._instance == null) {
      this._instance = this._read();
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
      throw notSet(names.mongoDomain);
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

  /** Parses the environment variables from `process.env`. */
  private static _read() {
    // NODE_ENV.
    const nodeEnv = process.env[names.nodeEnv] ?? defaults.nodeEnv;
    if (nodeEnv == null) {
      throw notSet(names.nodeEnv);
    }

    // PORT.
    const portStr = process.env[names.port] ?? defaults.port;
    if (portStr == null) {
      throw notSet(names.port);
    }
    const port = parseIntNull(portStr);
    if (port == null) {
      throw new Error(`Environment variable ${names.port} is not a number.`);
    }

    // URL.
    const url = process.env[names.url];
    if (url == null) {
      throw notSet(names.url);
    }

    // CONFIG and CONFIG_OFFLINE.
    const config = process.env[names.config];
    const configOffline = process.env[names.configOffline] ?? null;
    if (config == null) {
      throw notSet(names.config);
    }

    // MONGO_DOMAIN, MONGO_USERNAME, and MONGO_PASSWORD.
    const mongoDomain = process.env[names.mongoDomain] ?? null;
    const mongoUsername = process.env[names.mongoUsername] ?? null;
    const mongoPassword = process.env[names.mongoPassword] ?? null;
    let mongo: MongoVars | null = null;
    if (mongoDomain != null || mongoUsername != null || mongoPassword != null) {
      if (mongoDomain == null) {
        throw notSet(names.mongoDomain);
      }
      if (mongoUsername == null) {
        throw notSet(names.mongoUsername);
      }
      if (mongoPassword == null) {
        throw notSet(names.mongoPassword);
      }
      mongo = {
        domain: mongoDomain,
        username: mongoUsername,
        password: mongoPassword,
      };
    }

    // PTV_DEV_ID and PTV_DEV_KEY.
    const ptvDevId = process.env[names.ptvDevId] ?? null;
    const ptvKey = process.env[names.ptvDevKey] ?? null;
    let ptv: PtvVars | null = null;
    if (ptvDevId != null || ptvKey != null) {
      if (ptvDevId == null) {
        throw notSet(names.ptvDevId);
      }
      if (ptvKey == null) {
        throw notSet(names.ptvDevKey);
      }
      ptv = {
        devId: ptvDevId,
        devKey: ptvKey,
      };
    }

    // GTFS_REALTIME_KEY.
    const gtfsRealtimeKey = process.env[names.gtfsRealtimeKey] ?? null;

    // SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD.
    const superadminUsername = process.env[names.superadminUsername] ?? null;
    const superadminPassword = process.env[names.superadminPassword] ?? null;
    let superadmin: SuperadminVars | null = null;
    if (superadminUsername != null || superadminPassword != null) {
      if (superadminUsername == null) {
        throw notSet(names.superadminUsername);
      }
      if (superadminPassword == null) {
        throw notSet(names.superadminPassword);
      }
      superadmin = {
        username: superadminUsername,
        password: superadminPassword,
      };
    }

    // RELAY_KEY.
    const relayKey = process.env[names.relayKey] ?? null;

    return new EnvironmentVariables(
      nodeEnv,
      port,
      url,
      config,
      configOffline,
      mongo,
      ptv,
      gtfsRealtimeKey,
      superadmin,
      relayKey,
    );
  }
}

/** Environment variable `name` is not set. */
function notSet(name: string) {
  return new Error(`Environment variable ${name} is not set.`);
}
