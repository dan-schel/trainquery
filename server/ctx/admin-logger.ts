import { Server, TrainQuery } from "./trainquery";
import { FullConfig } from "../config/computed-config";
import { EnvironmentOptions } from "./environment-options";
import chalk from "chalk";
import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { TrainQueryDB } from "./trainquery-db";
import { AdminLoggingOptions } from "./admin-logs";
import {
  AdminLog,
  AdminLogLevel,
  AdminLogService,
  AdminLogWindow,
} from "../../shared/admin/logs";
import { Logger } from "./logger";
import { DisruptionTransactions } from "../disruptions/disruptions-database";
import { Transaction } from "../disruptions/transaction";

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
    // TODO: This logic doesn't belong here. I'm imagining there should be a
    // separate AdminLoggingService service with the flushing logic. It should
    // be provided with a reference to this class, which only handles filling
    // the buffer, and providing a flush method to empty it when the service
    // asks. Then we can do proper error handling logic there. This file should
    // not even import TrainQueryDB.

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
        // eslint-disable-next-line no-console
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

  async getWindow(
    ctx: TrainQuery,
    instance: string,
    beforeSequence: number | null,
    count: number,
  ): Promise<AdminLogWindow> {
    // TODO: This method doesn't belong here, move it to a new file like how
    // getDepartures() is. Sometimes we we're not even querying this instance!

    const db = ctx.database;

    if (this.instance !== instance) {
      // TODO: How can we know what the beforeSequence should be for another
      // instance?
      //
      // I think we'll need another db query to simply fetch the latest X,
      // sorted by sequence number.
      return new AdminLogWindow(instance, [], {
        beforeSequence: 0,
        count: 0,
      });
    }

    // If beforeSequence is null, use the latest logs we have.
    const start = beforeSequence ?? this._nextSequence;
    const query = {
      beforeSequence: start,
      count: count,
    };

    // See if any of the requested logs are in the buffer.
    const buffered = this._buffer.filter(
      (x) => x.sequence < start && x.sequence >= start - count,
    );

    // If we have enough from the buffer alone (or there is no DB connected),
    // return them. All done!
    if (buffered.length >= count || db == null) {
      return new AdminLogWindow(this.instance, buffered, query);
    }

    // Otherwise get the rest from the database.
    const remaining = count - buffered.length;
    const fetched = await db.fetchLogs(
      this.instance,
      buffered[0]?.sequence ?? start,
      remaining,
    );
    const joined = [...fetched.logs, ...buffered];
    return new AdminLogWindow(this.instance, joined, query);
  }

  async getAvailableInstances(_ctx: TrainQuery): Promise<string[]> {
    // TODO: We need a DB query to aggregate all available logs and return the
    // unique instance IDs (and add this instance ID to the list it returns just
    // in case it hasn't flushed any yet (or is offline).
    return [this.instance];
  }

  logInstanceStarting(instanceID: string): void {
    this._log("info", null, `Instance "${instanceID}" starting...`);
  }
  logServerListening(server: Server): void {
    // TODO: We used to import ExpressServer here, but that caused a circular
    // dependency. I don't like this solution much though.
    if ("port" in server && typeof server.port === "number") {
      this._log("info", null, `Server listening on port ${server.port}.`);
    } else {
      this._log("info", null, "Server ready.");
    }
  }
  logEnvOptions(envOptions: EnvironmentOptions): void {
    this._log("info", null, envOptions.toLogString());
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
  logDisruptionProvidersNotReady(numUnavailable: number): void {
    this._log(
      "warn",
      "disruptions",
      `Waiting for data from ${numUnavailable} ${
        numUnavailable === 1 ? "provider" : "providers"
      } before processing new external disruptions.`,
    );
  }
  logDisruptionTransactions(transactions: DisruptionTransactions): void {
    const statements: string[] = [];

    const forAction = (
      array: unknown[],
      verb: string,
      singular: string,
      plural: string,
    ) => {
      if (array.length > 0) {
        const noun = array.length === 1 ? singular : plural;
        statements.push(`${verb} ${array.length.toFixed()} ${noun}`);
      }
    };

    const forCollection = (
      transaction: Transaction<any, any>,
      singular: string,
      plural: string,
    ) => {
      const actions = transaction.getActions();
      forAction(actions.add, "Added", singular, plural);
      forAction(actions.update, "Updated", singular, plural);
      forAction(actions.delete, "Deleted", singular, plural);
    };

    forCollection(transactions.disruptions, "disruption", "disruptions");
    forCollection(transactions.inbox, "inbox entry", "inbox entries");
    forCollection(transactions.rejected, "rejected entry", "rejected entries");

    if (statements.length === 0) {
      return;
    }

    const bulletPoints = statements.map((x) => `  - ${x}`).join("\n");
    this._log("info", "disruptions", `Processed disruptions:\n${bulletPoints}`);
  }
}
