import { FullConfig } from "./config/computed-config";
import { ExpressServer } from "./express-server";
import { Logger, Server } from "./trainquery";

export class ConsoleLogger extends Logger {
  logServerListening(server: Server): void {
    if (server instanceof ExpressServer) {
      console.log(`Server listening on port ${server.port}.`);
    } else {
      console.log("Server ready.");
    }
  }

  logConfigRefresh(config: FullConfig, initial: boolean): void {
    const stopCount = config.shared.stops.length;
    const lineCount = config.shared.lines.length;
    const hash = config.hash;
    const verb = initial ? "Loaded" : "Refreshed";
    console.log(
      `${verb} config "${hash}" (${stopCount} stop(s), ${lineCount} line(s)).`,
    );
  }
  logConfigRefreshFailure(err: unknown): void {
    console.log("Failed to refresh config.", err);
  }

  logTimetableLoadFail(path: string): void {
    console.log(`Failed to load timetable "${path}".`);
  }

  logRecallingGtfs(): void {
    console.log("Retrieving GTFS data from database...");
  }
  logRecallingGtfsSuccess(): void {
    console.log("Successfully retrieved GTFS data from database.");
  }
  logRecallingGtfsEmpty(): void {
    console.log("No GTFS data was found in the database.");
  }
  logRecallingGtfsFailure(err: unknown): void {
    console.warn("Failed to retrieve GTFS data from database.", err);
  }
  logRefreshingGtfs(): void {
    console.log("Refreshing/parsing GTFS data...");
  }
  logRefreshingGtfsSuccess(): void {
    console.log("Successfully refreshed/parsed GTFS data.");
  }
  logRefreshingGtfsFailure(err: unknown): void {
    console.warn("Failed to refresh/parse GTFS data.", err);
  }
  logPersistingGtfs(): void {
    console.log("Saving GTFS to database...");
  }
  logPersistingGtfsSuccess(): void {
    console.log("Successfully saved GTFS data to database.");
  }
  logPersistingGtfsFailure(err: unknown): void {
    console.warn("Failed to save GTFS data to database.", err);
  }

  logFetchingDisruptions(source: string): void {
    console.log(`Fetching disruptions from "${source}"...`);
  }
  logFetchingDisruptionsSuccess(source: string, count: number): void {
    console.log(`Successfully fetched ${count} disruptions from "${source}".`);
  }
  logFetchingDisruptionsFailure(source: string, err: unknown): void {
    console.warn(`Failed to fetch disruptions from "${source}".`, err);
  }
}
