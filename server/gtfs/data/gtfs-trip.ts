import { z } from "zod";
import { QTimetableTime } from "../../../shared/qtime/qtime";
import {
  LineID,
  RouteVariantID,
  DirectionID,
  LineIDJson,
  RouteVariantIDJson,
  DirectionIDJson,
} from "../../../shared/system/ids";

export type GtfsTripIDPair = {
  gtfsTripID: string;
  gtfsCalendarID: string;
  continuationIndex: number;
};

export type TimeWithSequenceNumber = {
  time: QTimetableTime;
  sequence: number;
};

export class GtfsTrip {
  constructor(
    /**
     * This trip might be multiple duplicated trips from different calendars
     * combined.
     */
    readonly idPairs: GtfsTripIDPair[],
    readonly gtfsSubfeedID: string | null,
    readonly vetoedCalendars: Set<string>,
    readonly line: LineID,
    readonly route: RouteVariantID,
    readonly direction: DirectionID,
    readonly times: (TimeWithSequenceNumber | null)[],
  ) {}

  static readonly json = z
    .object({
      idPairs: z
        .object({
          gtfsTripID: z.string(),
          gtfsCalendarID: z.string(),
          continuationIndex: z.number(),
        })
        .array(),
      gtfsSubfeedID: z.string().nullable(),
      vetoedCalendars: z.string().array(),
      line: LineIDJson,
      route: RouteVariantIDJson,
      direction: DirectionIDJson,
      times: z
        .object({
          time: QTimetableTime.json,
          sequence: z.number(),
        })
        .nullable()
        .array(),
    })
    .transform(
      (x) =>
        new GtfsTrip(
          x.idPairs,
          x.gtfsSubfeedID,
          new Set(x.vetoedCalendars),
          x.line,
          x.route,
          x.direction,
          x.times,
        ),
    );

  withSubfeedID(subfeedID: string): GtfsTrip {
    return new GtfsTrip(
      this.idPairs,
      subfeedID,
      this.vetoedCalendars,
      this.line,
      this.route,
      this.direction,
      this.times,
    );
  }

  addIDPair(idPair: GtfsTripIDPair): GtfsTrip {
    return this.withIDPairs([...this.idPairs, idPair]);
  }

  withIDPairs(idPairs: GtfsTripIDPair[]): GtfsTrip {
    return new GtfsTrip(
      idPairs,
      this.gtfsSubfeedID,
      this.vetoedCalendars,
      this.line,
      this.route,
      this.direction,
      this.times,
    );
  }

  addVetoedCalendars(vetoedCalendars: string[]): GtfsTrip {
    return new GtfsTrip(
      this.idPairs,
      this.gtfsSubfeedID,
      new Set([...this.vetoedCalendars, ...vetoedCalendars]),
      this.line,
      this.route,
      this.direction,
      this.times,
    );
  }

  toJSON(): z.input<typeof GtfsTrip.json> {
    return {
      idPairs: this.idPairs,
      gtfsSubfeedID: this.gtfsSubfeedID,
      vetoedCalendars: Array.from(this.vetoedCalendars.values()),
      line: this.line,
      route: this.route,
      direction: this.direction,
      times: this.timesJSON(),
    };
  }

  computeHashKey() {
    return JSON.stringify({
      line: this.line,
      route: this.route,
      direction: this.direction,
      times: this.timesJSON(),
    });
  }

  timesJSON() {
    return this.times.map((t) =>
      t == null
        ? null
        : {
            time: t.time.toJSON(),
            sequence: t.sequence,
          },
    );
  }

  requireIDPair(gtfsCalendarID: string): GtfsTripIDPair {
    const pair = this.idPairs.find((p) => p.gtfsCalendarID === gtfsCalendarID);
    if (pair == null) {
      throw new Error(
        `Trip did not have an ID under calendar "${gtfsCalendarID}".`,
      );
    }
    return pair;
  }

  logIDPairs(name: string, log: (message: string) => void) {
    log(name);
    this.idPairs.forEach((p) => {
      log(` -  ${p.gtfsCalendarID}: ${p.gtfsTripID} (${p.continuationIndex})`);
    });
    this.vetoedCalendars.forEach((c) => {
      log(` -  VETOED: ${c}`);
    });
  }

  hasIDPair(gtfsTripID: string, continuationIndex: number) {
    return this.idPairs.some(
      (p) =>
        p.gtfsTripID === gtfsTripID &&
        p.continuationIndex === continuationIndex,
    );
  }

  static oneIs(
    gtfsTripID: string,
    continuationIndex: number,
    ...trips: GtfsTrip[]
  ) {
    return trips.some((t) => t.hasIDPair(gtfsTripID, continuationIndex));
  }
}
