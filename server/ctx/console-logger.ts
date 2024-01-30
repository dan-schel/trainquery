import { FullConfig } from "../config/computed-config";
import { EnvironmentOptions } from "./environment-options";
import { ExpressServer } from "./express-server";
import { Logger, Server } from "./trainquery";

export class ConsoleLogger extends Logger {
  logServerListening(server: Server): void {
    if (server instanceof ExpressServer) {
      console.log(`[WEB] Server listening on port ${server.port}.`);
    } else {
      console.log("[WEB] Server ready.");
    }
  }
  logConfigRefresh(config: FullConfig, initial: boolean): void {
    const stopCount = config.shared.stops.length;
    const lineCount = config.shared.lines.length;
    const hash = config.hash;
    const verb = initial ? "Loaded" : "Refreshed";
    console.log(
      `[CONFIG] ${verb} config "${hash}" (${stopCount} stop(s), ${lineCount} line(s)).`,
    );
  }
  logConfigRefreshFailure(err: unknown): void {
    console.log("[CONFIG] Failed to refresh config.", err);
  }
  logTimetableLoadFail(path: string): void {
    console.log(`[CONFIG] Failed to load timetable "${path}".`);
  }
  logEnvOptions(envOptions: EnvironmentOptions): void {
    envOptions.log((x) => console.log(x));
  }

  logRecallingGtfs(): void {
    console.log("[GTFS] Retrieving GTFS data from database...");
  }
  logRecallingGtfsSuccess(): void {
    console.log("[GTFS] Successfully retrieved GTFS data from database.");
  }
  logRecallingGtfsEmpty(): void {
    console.log("[GTFS] No GTFS data was found in the database.");
  }
  logRecallingGtfsFailure(err: unknown): void {
    console.warn("[GTFS] Failed to retrieve GTFS data from database.", err);
  }
  logRefreshingGtfs(): void {
    console.log("[GTFS] Refreshing/parsing GTFS data...");
  }
  logRefreshingGtfsSuccess(): void {
    console.log("[GTFS] Successfully refreshed/parsed GTFS data.");
  }
  logRefreshingGtfsFailure(err: unknown): void {
    console.warn("[GTFS] Failed to refresh/parse GTFS data.", err);
  }
  logPersistingGtfs(): void {
    console.log("[GTFS] Saving GTFS to database...");
  }
  logPersistingGtfsSuccess(): void {
    console.log("[GTFS] Successfully saved GTFS data to database.");
  }
  logPersistingGtfsFailure(err: unknown): void {
    console.warn("[GTFS] Failed to save GTFS data to database.", err);
  }
  logRefreshingGtfsRealtime(): void {
    // console.log("[GTFS-R] Refreshing realtime data...");
  }
  logRefreshingGtfsRealtimeSuccess(): void {
    console.log("[GTFS-R] Successfully refreshed realtime data.");
  }
  logRefreshingGtfsRealtimeFailure(err: unknown): void {
    console.warn("[GTFS-R] Failed to refresh realtime data.", err);
  }

  logFetchingDisruptions(source: string): void {
    console.log(`[DISRUPTIONS] Fetching disruptions from "${source}"...`);
  }
  logFetchingDisruptionsSuccess(source: string, count: number): void {
    console.log(
      `[DISRUPTIONS] Successfully fetched ${count} disruptions from "${source}".`,
    );
  }
  logFetchingDisruptionsFailure(source: string, err: unknown): void {
    console.warn(
      `[DISRUPTIONS] Failed to fetch disruptions from "${source}".`,
      err,
    );
  }
}
