import { z } from "zod";
import { Logger, Server, TrainQuery } from "./trainquery";
import { FullConfig } from "../config/computed-config";
import { EnvironmentOptions } from "./environment-options";
import { ExpressServer } from "./express-server";
import chalk from "chalk";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { TrainQueryDB } from "./trainquery-db";

export const AdminLogLevels = ["info", "warn"] as const;
export type AdminLogLevel = (typeof AdminLogLevels)[number];
export const AdminLogLevelsJson = z.enum(AdminLogLevels);

// TODO: In future this enum will probably be more generally used outside of
// the admin logger, so it might move out of this file.
export const AdminLogServices = [
  "config",
  "disruptions",
  "gtfs",
  "gtfs-r",
  "auth",
] as const;
export type AdminLogService = (typeof AdminLogServices)[number];
export const AdminLogServicesJson = z.enum(AdminLogServices);

export class AdminLoggingOptions {
  constructor(
    readonly info: AdminLogService[] | "all",
    readonly warn: AdminLogService[] | "all",
    readonly writeToDatabase: boolean,
  ) {}

  static readonly json = z
    .object({
      info: z.union([z.array(AdminLogServicesJson), z.literal("all")]),
      warn: z.union([z.array(AdminLogServicesJson), z.literal("all")]),
      writeToDatabase: z.boolean(),
    })
    .transform(
      (x) => new AdminLoggingOptions(x.info, x.warn, x.writeToDatabase),
    );

  toJSON(): z.input<typeof AdminLoggingOptions.json> {
    return {
      info: this.info,
      warn: this.warn,
      writeToDatabase: this.writeToDatabase,
    };
  }
}

export class AdminLog {
  constructor(
    readonly instance: string,
    readonly level: AdminLogLevel,
    readonly service: AdminLogService | null,
    readonly message: string,
    readonly timestamp: QUtcDateTime,
  ) {}

  static readonly json = z.object({
    instance: z.string(),
    level: AdminLogLevelsJson,
    service: AdminLogServicesJson.nullable(),
    message: z.string(),
    timestamp: QUtcDateTime.json,
  });

  static readonly mongo = z.object({
    instance: z.string(),
    level: AdminLogLevelsJson,
    service: AdminLogServicesJson.nullable(),
    message: z.string(),
    timestamp: QUtcDateTime.mongo,
  });

  toJSON(): z.input<typeof AdminLog.json> {
    return {
      instance: this.instance,
      level: this.level,
      service: this.service,
      message: this.message,
      timestamp: this.timestamp.toJSON(),
    };
  }

  toMongo(): z.input<typeof AdminLog.mongo> {
    return {
      instance: this.instance,
      level: this.level,
      service: this.service,
      message: this.message,
      timestamp: this.timestamp.toMongo(),
    };
  }
}

/** Flush logs out to database every 10 seconds. */
const flushIntervalMillis = 10 * 1000;

/** Cleanup logs over 7 days old every 24 hours. */
const cleanupIntervalMillis = 24 * 60 * 60 * 1000;

/** Cleanup logs over 7 days old. */
const cleanupOlderThanDays = 7;

export class AdminLogger extends Logger {
  private _buffer: AdminLog[] = [];

  constructor(
    readonly instance: string,
    readonly options: AdminLoggingOptions,
  ) {
    super();
  }

  async init(ctx: TrainQuery) {
    const db = ctx.database;

    if (!this.options.writeToDatabase || db == null) {
      return;
    }

    await this._cleanup(db);
    setInterval(() => this._cleanup(db), cleanupIntervalMillis);
    await this._flush(db);
    setInterval(() => this._flush(db), flushIntervalMillis);
  }

  private async _flush(db: TrainQueryDB) {
    if (this._buffer.length === 0) {
      return;
    }

    await db.writeLogs(this._buffer);
    this._buffer = [];
  }

  private async _cleanup(db: TrainQueryDB) {
    await db.cleanupOldLogs(cleanupOlderThanDays);
  }

  private _log(
    level: AdminLogLevel,
    service: AdminLogService | null,
    message: string,
  ): void {
    const log = new AdminLog(this.instance, level, service, message, nowUTC());
    this._buffer.push(log);

    // Also log to the console if the service is configured to do so.
    const servicesToLogToConsole = this.options[level];
    if (
      service == null ||
      servicesToLogToConsole === "all" ||
      servicesToLogToConsole.includes(service)
    ) {
      const text = `${service != null ? `[${service}] ` : ""}${message}`;
      if (level === "warn") {
        console.warn(chalk.yellow(text));
      } else {
        console.log(text);
      }
    }
  }

  logInstanceStarting(instanceID: string): void {
    this._log("info", null, `Instance "${instanceID}" starting...`);
  }
  logServerListening(server: Server): void {
    if (server instanceof ExpressServer) {
      this._log("info", null, `Server listening on port ${server.port}.`);
    } else {
      this._log("info", null, "Server ready.");
    }
  }
  logEnvOptions(envOptions: EnvironmentOptions): void {
    envOptions.log((x) => this._log("info", null, x));
  }

  logConfigRefresh(config: FullConfig, initial: boolean): void {
    const stopCount = config.shared.stops.length;
    const lineCount = config.shared.lines.length;
    const hash = config.hash;
    const verb = initial ? "Loaded" : "Refreshed";
    this._log(
      "info",
      "config",
      `${verb} config "${hash}" (${stopCount} stop(s), ${lineCount} line(s)).`,
    );
  }
  logConfigRefreshFailure(err: unknown): void {
    this._log("info", "config", `Failed to refresh config. ${err}`);
  }
  logTimetableLoadFail(path: string): void {
    this._log("info", "config", `Failed to load timetable "${path}".`);
  }
  logRecallingGtfs(): void {
    this._log("info", "gtfs", "Retrieving GTFS data from database...");
  }
  logRecallingGtfsSuccess(): void {
    this._log(
      "info",
      "gtfs",
      "Successfully retrieved GTFS data from database.",
    );
  }
  logRecallingGtfsEmpty(): void {
    this._log("info", "gtfs", "No GTFS data was found in the database.");
  }
  logRecallingGtfsFailure(err: unknown): void {
    this._log(
      "warn",
      "gtfs",
      `Failed to retrieve GTFS data from database. ${err}`,
    );
  }
  logRefreshingGtfs(): void {
    this._log("info", "gtfs", "Refreshing/parsing GTFS data...");
  }
  logRefreshingGtfsSuccess(): void {
    this._log("info", "gtfs", "Successfully refreshed/parsed GTFS data.");
  }
  logRefreshingGtfsFailure(err: unknown): void {
    this._log("warn", "gtfs", `Failed to refresh/parse GTFS data. ${err}`);
  }
  logPersistingGtfs(): void {
    this._log("info", "gtfs", "Saving GTFS to database...");
  }
  logPersistingGtfsSuccess(): void {
    this._log("info", "gtfs", "Successfully saved GTFS data to database.");
  }
  logPersistingGtfsFailure(err: unknown): void {
    this._log("warn", "gtfs", `Failed to save GTFS data to database. ${err}`);
  }

  logRefreshingGtfsRealtime(_subfeed: string | null): void {
    // this._log("info", "gtfs-r", "Refreshing realtime data...");
  }
  logRefreshingGtfsRealtimeSuccess(_subfeed: string | null): void {
    this._log("info", "gtfs-r", "Successfully refreshed realtime data.");
  }
  logRefreshingGtfsRealtimeFailure(subfeed: string | null, err: unknown): void {
    this._log("warn", "gtfs-r", `Failed to refresh realtime data. ${err}`);
  }

  logFetchingDisruptions(source: string): void {
    this._log(
      "info",
      "disruptions",
      `Fetching disruptions from "${source}"...`,
    );
  }
  logFetchingDisruptionsSuccess(source: string, count: number): void {
    this._log(
      "info",
      "disruptions",
      `Successfully fetched ${count} disruptions from "${source}".`,
    );
  }
  logFetchingDisruptionsFailure(source: string, err: unknown): void {
    this._log(
      "warn",
      "disruptions",
      `Failed to fetch disruptions from "${source}". ${err}`,
    );
  }
}
