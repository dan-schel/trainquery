import { FullConfig } from "./config/computed-config";
import { ExpressServer } from "./express-server";
import { Logger, Server } from "./trainquery";

export class ConsoleLogger extends Logger {
  logListening(server: Server): void {
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
      `${verb} config "${hash}" (${stopCount} stop(s), ${lineCount} line(s)).`
    );
  }

  logTimetableLoadFail(path: string): void {
    console.log(`Failed to load timetable "${path}".`);
  }

  logLoadingGtfs(): void {
    console.log("Retrieving GTFS data...");
  }
  logGtfsDownloadError(err: unknown): void {
    console.warn("Failed to retrieve GTFS data.", err);
  }
  logGtfsReady(): void {
    console.log("Successfully retrieved GTFS data.");
  }

  logPersistingGtfs(): void {
    console.log("Saving GTFS to database...");
  }
  logGtfsPersisted(): void {
    console.log("Successfully saved GTFS data to database.");
  }
}
