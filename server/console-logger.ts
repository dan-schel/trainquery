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
  logDownloadingGtfs(): void {
    console.log("Downloading GTFS data...");
  }
  logDownloadingGtfsSuccess(): void {
    console.log("Successfully downloaded GTFS data.");
  }
  logDownloadingGtfsFailure(err: unknown): void {
    console.warn("Failed to download GTFS data.", err);
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
}
