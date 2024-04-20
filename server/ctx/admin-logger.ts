import { Logger, Server, TrainQuery } from "./trainquery";
import { FullConfig } from "../config/computed-config";
import { EnvironmentOptions } from "./environment-options";
import { ExpressServer } from "./express-server";
import chalk from "chalk";
import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { TrainQueryDB } from "./trainquery-db";
import {
  AdminLog,
  AdminLogLevel,
  AdminLogService,
  AdminLogWindow,
  AdminLoggingOptions,
} from "./admin-logs";

/** Flush logs out to database every 10 seconds. */
const flushIntervalMillis = 10 * 1000;

/** Cleanup logs over 7 days old every 24 hours. */
const cleanupIntervalMillis = 24 * 60 * 60 * 1000;

/** Cleanup logs over 7 days old. */
const cleanupOlderThanDays = 7;

export class AdminLogger extends Logger {
  private _buffer: AdminLog[] = [];
  private _nextSequence = 0;

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
    const log = new AdminLog(
      this.instance,
      this._nextSequence,
      level,
      service,
      message,
      nowUTC(),
    );
    this._nextSequence++;
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

  getBufferedWindow(): AdminLogWindow {
    return new AdminLogWindow(this.instance, [...this._buffer], {
      beforeSequence: this._nextSequence,
      count: this._buffer.length,
    });
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
