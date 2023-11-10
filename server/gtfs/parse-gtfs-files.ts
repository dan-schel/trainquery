import path from "path";
import fs from "fs";
import { GtfsCalendar, GtfsData, GtfsTrip } from "./gtfs-data";
import csvParser from "csv-parser";
import { z } from "zod";
import {
  calendarDatesSchema,
  calendarSchema,
  stopTimesSchema,
  tripsSchema,
} from "./gtfs-csv-schemas";
import { QWeekdayRange } from "../../shared/qtime/qweekdayrange";
import { MatchedRoute, matchToRoute } from "./find-match";
import { StopID } from "../../shared/system/ids";
import { TrainQuery } from "../trainquery";
import { QTimetableTime } from "../../shared/qtime/qtime";
import { GtfsParsingReport } from "./gtfs-parsing-report";
import { nowUTCLuxon } from "../../shared/qtime/luxon-conversions";
import { HasSharedConfig, requireLine } from "../../shared/system/config-utils";
import { nullableEquals } from "@schel-d/js-utils";

export async function parseGtfsFiles(
  ctx: TrainQuery,
  directory: string,
  stopMap: Map<number, StopID>,
): Promise<GtfsData> {
  const config = ctx.getConfig();

  const parsingReport = GtfsParsingReport.blank();
  const rawCalendars = await readCsv(
    path.join(directory, "calendar.txt"),
    calendarSchema,
  );
  const rawCalendarDates = await readCsv(
    path.join(directory, "calendar_dates.txt"),
    calendarDatesSchema,
  );
  const calendars = parseCalendars(rawCalendars, rawCalendarDates);

  const rawTrips = await readCsv(
    path.join(directory, "trips.txt"),
    tripsSchema,
  );
  const rawStopTimes = await readCsv(
    path.join(directory, "stop_times.txt"),
    stopTimesSchema,
  );
  const trips = parseTrips(
    config,
    rawTrips,
    rawStopTimes,
    stopMap,
    parsingReport,
  );

  return new GtfsData(
    calendars,
    trips,
    config.hash,
    parsingReport,
    nowUTCLuxon(),
  );
}

function parseCalendars(
  rawCalendars: z.infer<typeof calendarSchema>[],
  rawCalendarDates: z.infer<typeof calendarDatesSchema>[],
): GtfsCalendar[] {
  return rawCalendars.map((c) => {
    const gtfsCalendarID = c.service_id;
    const wdr = new QWeekdayRange(
      c.monday,
      c.tuesday,
      c.wednesday,
      c.thursday,
      c.friday,
      c.saturday,
      c.sunday,
    );
    const start = c.start_date;
    const end = c.end_date;
    const additionalDates = rawCalendarDates
      .filter(
        (d) => d.service_id == c.service_id && d.exception_type == "added",
      )
      .map((d) => d.date);
    const exceptions = rawCalendarDates
      .filter(
        (d) => d.service_id == c.service_id && d.exception_type == "removed",
      )
      .map((d) => d.date);
    return new GtfsCalendar(
      gtfsCalendarID,
      null,
      wdr,
      start,
      end,
      additionalDates,
      exceptions,
    );
  });
}

function parseTrips(
  config: HasSharedConfig,
  rawTrips: z.infer<typeof tripsSchema>[],
  rawStopTimes: z.infer<typeof stopTimesSchema>[],
  stopMap: Map<number, StopID>,
  parsingReport: GtfsParsingReport,
): GtfsTrip[] {
  rawTrips.sort((a, b) => a.trip_id.localeCompare(b.trip_id));
  rawStopTimes.sort((a, b) => a.trip_id.localeCompare(b.trip_id));

  const result = new Map<string, GtfsTrip>();

  let thisTrip: {
    stop: number | null;
    gtfsStop: number;
    value: QTimetableTime;
  }[] = [];
  let tripIndex = 0;
  let trip = rawTrips[tripIndex];

  function addResult() {
    const gtfsTripID = trip.trip_id;
    const gtfsCalendarID = trip.service_id;
    const stopTimes = thisTrip;

    const unknownStops = stopTimes
      .filter((e) => e.stop == null)
      .map((s) => s.gtfsStop);
    if (unknownStops.length != 0) {
      parsingReport.logRejectedStop(...unknownStops);
      parsingReport.logRejectedTrip();
      return null;
    }

    type AllGood = ((typeof stopTimes)[number] & { stop: StopID })[];
    const match = matchToRoute(config, stopTimes as AllGood);

    if (match == null) {
      parsingReport.logRejectedRoute((stopTimes as AllGood).map((x) => x.stop));
      parsingReport.logRejectedTrip();
      return null;
    }

    const matchedRoutes = continuationsArray(match);

    for (let i = 0; i < matchedRoutes.length; i++) {
      const matchedRoute = matchedRoutes[i];
      const { line, associatedLines, route, direction, values } = matchedRoute;

      const idPair = {
        gtfsTripID: gtfsTripID,
        gtfsCalendarID: gtfsCalendarID,
        continuationIndex: i,
      };
      const parsedTrip = new GtfsTrip(
        [idPair],
        null,
        line,
        associatedLines,
        route,
        direction,
        values,
      );
      const hashKey = parsedTrip.computeHashKey();

      const existing = result.get(hashKey);
      if (existing != null) {
        result.set(hashKey, existing.addIDPair(idPair));
        parsingReport.logDuplicatedTrip();
      } else {
        result.set(hashKey, parsedTrip);
      }
    }
  }

  for (let i = 0; i < rawStopTimes.length; i++) {
    const thisStopTime = rawStopTimes[i];
    if (thisStopTime.trip_id != trip.trip_id) {
      tripIndex++;
      while (rawTrips[tripIndex].trip_id != thisStopTime.trip_id) {
        tripIndex++;
        if (tripIndex >= rawTrips.length) {
          throw new Error(
            "Trips mentioned in stop_times.txt are not present in trips.txt.",
          );
        }
      }
      addResult();
      trip = rawTrips[tripIndex];
      thisTrip = [];
    }
    thisTrip.push({
      stop: stopMap.get(thisStopTime.stop_id) ?? null,
      gtfsStop: thisStopTime.stop_id,
      value: thisStopTime.departure_time,
    });
  }
  addResult();

  return dedupeTrips(config, Array.from(result.values()), parsingReport);
}

async function readCsv<T extends z.ZodType>(
  path: string,
  schema: T,
): Promise<z.infer<T>[]> {
  return await new Promise((resolve) => {
    const results: z.infer<T>[] = [];
    fs.createReadStream(path)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim(),
        }),
      )
      .on("data", (row) => {
        results.push(schema.parse(row));
      })
      .on("end", () => {
        resolve(results);
      });
  });
}

function continuationsArray<T>(
  match: MatchedRoute<T>,
): Omit<MatchedRoute<T>, "continuation">[] {
  if (match.continuation != null) {
    return [match, ...continuationsArray(match.continuation)];
  }
  return [match];
}

function dedupeTrips(
  config: HasSharedConfig,
  trips: GtfsTrip[],
  parsingReport: GtfsParsingReport,
): GtfsTrip[] {
  for (let i = 0; i < trips.length - 1; i++) {
    for (let j = i + 1; j < trips.length; j++) {
      const a = trips[i];
      const b = trips[j];

      if (
        [a.line, ...a.associatedLines].includes(b.line) ||
        [b.line, ...b.associatedLines].includes(a.line)
      ) {
        continue;
      }

      const aBounds = determineBoundaryIndices(a.times);
      const bBounds = determineBoundaryIndices(b.times);

      const aStopList = requireLine(config, a.line)
        .route.requireStopList(a.route, a.direction)
        .stops.slice(aBounds.start, aBounds.end + 1);
      const bStopList = requireLine(config, b.line)
        .route.requireStopList(b.route, b.direction)
        .stops.slice(aBounds.start, aBounds.end + 1);
      const aSlice = a.times.slice(aBounds.start, aBounds.end + 1);
      const bSlice = b.times.slice(bBounds.start, bBounds.end + 1);

      if (aSlice.length > bSlice.length) {
        if (isSubset(aSlice, bSlice, aStopList, bStopList)) {
          trips[i] = mergeSubset(a, b);
          trips.splice(j, 1);
          j--;
          parsingReport.logDuplicatedTrip();
        }
      } else {
        if (isSubset(bSlice, aSlice, bStopList, aStopList)) {
          trips[j] = mergeSubset(b, a);
          trips.splice(i, 1);
          i--;
          j--;
          parsingReport.logDuplicatedTrip();
        }
      }
    }
  }

  parsingReport.logAcceptedTrips(trips.length);
  return trips;
}

function determineBoundaryIndices<T>(array: (T | null)[]) {
  let start: number | null = null;
  let end = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] != null) {
      if (start == null) {
        start = i;
      }
      end = i;
    }
  }
  if (start == null) {
    throw new Error(
      "Cannot determine boundary indices, the array is either empty or " +
        "contains only nulls.",
    );
  }
  return { start, end };
}

function isSubset(
  superset: (QTimetableTime | null)[],
  subset: (QTimetableTime | null)[],
  supersetStops: StopID[],
  subsetStops: StopID[],
): boolean {
  for (let start = 0; start < superset.length - subset.length; start++) {
    let matches = true;
    for (let i = 0; i < subset.length; i++) {
      if (supersetStops[i] != subsetStops[i + start]) {
        matches = false;
        break;
      }

      if (
        i != subset.length - 1 &&
        nullableEquals(superset[i], subset[i + start], (a, b) => a.equals(b))
      ) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return true;
    }
  }
  return false;
}

function mergeSubset(superset: GtfsTrip, subset: GtfsTrip) {
  // TODO: Use known continuation from subset service if available.
  return superset;
}
