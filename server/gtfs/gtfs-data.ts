import { unique } from "@schel-d/js-utils";
import { QDate } from "../../shared/qtime/qdate";
import { QTimetableTime } from "../../shared/qtime/qtime";
import { QWeekdayRange } from "../../shared/qtime/qweekdayrange";
import {
  DirectionID,
  DirectionIDJson,
  LineID,
  LineIDJson,
  RouteVariantID,
  RouteVariantIDJson,
} from "../../shared/system/ids";
import { GtfsParsingReport } from "./gtfs-parsing-report";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { z } from "zod";

export class GtfsData {
  constructor(
    readonly calendars: GtfsCalendar[],
    readonly trips: GtfsTrip[],
    readonly parsingReport: GtfsParsingReport,
    readonly age: QUtcDateTime,
  ) {}

  static merge(feeds: GtfsData[], subfeedIDs: string[]): GtfsData {
    if (feeds.length != subfeedIDs.length || !unique(subfeedIDs)) {
      throw new Error("Invalid arguments, cannot merge GTFS feeds.");
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

    return new GtfsData(calendars, trips, reporting, age);
  }

  static readonly metadataJson = z.object({
    parsingReport: GtfsParsingReport.json,
    age: QUtcDateTime.json,
  });

  metadataToJSON(): z.input<typeof GtfsData.metadataJson> {
    return {
      parsingReport: this.parsingReport.toJSON(),
      age: this.age.toJSON(),
    };
  }
}

export class GtfsCalendar {
  constructor(
    readonly gtfsCalendarID: string,
    readonly gtfsSubfeedID: string | null,
    readonly wdr: QWeekdayRange,
    readonly start: QDate,
    readonly end: QDate,
    readonly additionalDates: QDate[],
    readonly exceptions: QDate[],
  ) {}

  static readonly json = z
    .object({
      gtfsCalendarID: z.string(),
      gtfsSubfeedID: z.string().nullable(),
      wdr: QWeekdayRange.json,
      start: QDate.json,
      end: QDate.json,
      additionalDates: QDate.json.array(),
      exceptions: QDate.json.array(),
    })
    .transform(
      (x) =>
        new GtfsCalendar(
          x.gtfsCalendarID,
          x.gtfsSubfeedID,
          x.wdr,
          x.start,
          x.end,
          x.additionalDates,
          x.exceptions,
        ),
    );

  withSubfeedID(subfeedID: string): GtfsCalendar {
    return new GtfsCalendar(
      this.gtfsCalendarID,
      subfeedID,
      this.wdr,
      this.start,
      this.end,
      this.additionalDates,
      this.exceptions,
    );
  }

  toJSON(): z.input<typeof GtfsCalendar.json> {
    return {
      gtfsCalendarID: this.gtfsCalendarID,
      gtfsSubfeedID: this.gtfsSubfeedID,
      wdr: this.wdr.toString(),
      start: this.start.toISO(),
      end: this.end.toISO(),
      additionalDates: this.additionalDates.map((d) => d.toISO()),
      exceptions: this.exceptions.map((d) => d.toISO()),
    };
  }
}

export class GtfsTrip {
  constructor(
    readonly gtfsTripID: string,
    readonly gtfsSubfeedID: string | null,
    readonly gtfsCalendarID: string,
    readonly line: LineID,
    readonly associatedLines: LineID[],
    readonly route: RouteVariantID,
    readonly direction: DirectionID,
    readonly times: (QTimetableTime | null)[],
  ) {}

  static readonly json = z
    .object({
      gtfsTripID: z.string(),
      gtfsSubfeedID: z.string().nullable(),
      gtfsCalendarID: z.string(),
      line: LineIDJson,
      associatedLines: LineIDJson.array(),
      route: RouteVariantIDJson,
      direction: DirectionIDJson,
      times: QTimetableTime.json.nullable().array(),
    })
    .transform(
      (x) =>
        new GtfsTrip(
          x.gtfsTripID,
          x.gtfsSubfeedID,
          x.gtfsCalendarID,
          x.line,
          x.associatedLines,
          x.route,
          x.direction,
          x.times,
        ),
    );

  withSubfeedID(subfeedID: string): GtfsTrip {
    return new GtfsTrip(
      this.gtfsTripID,
      subfeedID,
      this.gtfsCalendarID,
      this.line,
      this.associatedLines,
      this.route,
      this.direction,
      this.times,
    );
  }

  toJSON(): z.input<typeof GtfsTrip.json> {
    return {
      gtfsTripID: this.gtfsTripID,
      gtfsSubfeedID: this.gtfsSubfeedID,
      gtfsCalendarID: this.gtfsCalendarID,
      line: this.line,
      associatedLines: this.associatedLines,
      route: this.route,
      direction: this.direction,
      times: this.times.map((t) => t?.toJSON() ?? null),
    };
  }
}
