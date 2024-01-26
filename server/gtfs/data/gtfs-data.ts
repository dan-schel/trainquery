import { GtfsCalendar } from "./gtfs-calendar";
import { GtfsTrip } from "./gtfs-trip";
import { GtfsParsingReport } from "../gtfs-parsing-report";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { unique } from "@schel-d/js-utils";
import { z } from "zod";
import { nowUTCLuxon } from "../../../shared/qtime/luxon-conversions";

/**
 * The calendars and trips parsed from the GTFS feeds. If realtime data is
 * available, it is also stored within this object ({@link liveTrips}).
 */
export class GtfsData {
  constructor(
    readonly calendars: GtfsCalendar[],
    /**
     * The trips, which may or may not contain realtime data, as
     * GtfsRealtimeTrip extends GtfsTrip.
     */
    readonly trips: GtfsTrip[],
    readonly configHash: string,
    readonly parsingReport: GtfsParsingReport,
    readonly age: QUtcDateTime,
  ) {}

  static merge(feeds: GtfsData[], subfeedIDs: string[]): GtfsData {
    if (feeds.length < 0) {
      throw new Error("Cannot merge, no feeds provided.");
    }
    if (feeds.length !== subfeedIDs.length) {
      throw new Error("Mismatch between feed count and subfeed ID count.");
    }
    if (!unique(subfeedIDs)) {
      throw new Error("Subfeed IDs must be unique.");
    }
    if (!feeds.every((f) => f.configHash === feeds[0].configHash)) {
      throw new Error("Cannot merge feeds created from differing configs.");
    }

    const calendars = subfeedIDs
      .map((subfeedID, i) =>
        feeds[i].calendars.map((c) => c.withSubfeedID(subfeedID)),
      )
      .flat();
    const trips = subfeedIDs
      .map((subfeedID, i) =>
        feeds[i].trips.map((c) => c.withSubfeedID(subfeedID)),
      )
      .flat();

    const reporting = GtfsParsingReport.merge(
      feeds.map((f) => f.parsingReport),
    );

    // As they say, "a feed is only as old as it's oldest subfeed".
    const age = feeds
      .map((f) => f.age)
      .sort((a, b) => a.asDecimal() - b.asDecimal())[0];

    return new GtfsData(calendars, trips, feeds[0].configHash, reporting, age);
  }

  static readonly metadataJson = z.object({
    configHash: z.string(),
    parsingReport: GtfsParsingReport.json,
    age: QUtcDateTime.json,
  });

  metadataToJSON(): z.input<typeof GtfsData.metadataJson> {
    return {
      configHash: this.configHash,
      parsingReport: this.parsingReport.toJSON(),
      age: this.age.toJSON(),
    };
  }

  isOld(refreshSeconds: number) {
    return this.age.isBeforeOrEqual(nowUTCLuxon().add({ s: -refreshSeconds }));
  }

  /**
   * Creates a new GtfsData object, replacing the trips field (designed to be
   * used to replace some trips with realtime trips).
   */
  withTrips(liveTrips: GtfsTrip[]) {
    return new GtfsData(
      this.calendars,
      liveTrips,
      this.configHash,
      this.parsingReport,
      this.age,
    );
  }

  /**
   * Returns the same data, but with the realtime trips stripped of their live
   * data.
   */
  withoutLiveData() {
    return new GtfsData(
      this.calendars,
      this.trips.map((t) => t.withoutLiveData()),
      this.configHash,
      this.parsingReport,
      this.age,
    );
  }
}
