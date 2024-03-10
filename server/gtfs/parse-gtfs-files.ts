import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import { z } from "zod";
import {
  calendarDatesSchema,
  calendarSchema,
  stopTimesSchema,
  tripsSchema,
} from "./gtfs-csv-schemas";
import { QWeekdayRange } from "../../shared/qtime/qweekdayrange";
import {
  MatchedRoute,
  getCombinationsForRouteID,
  matchToRoute,
} from "./find-match";
import { StopID } from "../../shared/system/ids";
import { TrainQuery } from "../ctx/trainquery";
import { QTimetableTime } from "../../shared/qtime/qtime";
import { GtfsParsingReport } from "./gtfs-parsing-report";
import { nowUTCLuxon } from "../../shared/qtime/luxon-conversions";
import { HasSharedConfig, requireLine } from "../../shared/system/config-utils";
import { nullableEquals } from "@dan-schel/js-utils";
import { GtfsFeedConfig } from "../config/gtfs-config";
import { GtfsCalendar } from "./data/gtfs-calendar";
import { GtfsData } from "./data/gtfs-data";
import { GtfsTrip, TimeWithSequenceNumber } from "./data/gtfs-trip";

export async function parseGtfsFiles(
  ctx: TrainQuery,
  directory: string,
  feedConfig: GtfsFeedConfig,
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
    feedConfig,
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
        (d) => d.service_id === c.service_id && d.exception_type === "added",
      )
      .map((d) => d.date);
    const exceptions = rawCalendarDates
      .filter(
        (d) => d.service_id === c.service_id && d.exception_type === "removed",
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
  feedConfig: GtfsFeedConfig,
  parsingReport: GtfsParsingReport,
): GtfsTrip[] {
  rawTrips.sort((a, b) => a.trip_id.localeCompare(b.trip_id));
  rawStopTimes.sort((a, b) => a.trip_id.localeCompare(b.trip_id));

  const result = new Map<string, GtfsTrip>();

  let thisTrip: {
    stop: number | null;
    gtfsStop: number;
    value: TimeWithSequenceNumber;
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
    if (unknownStops.length !== 0) {
      parsingReport.logRejectedStop(...unknownStops);
      parsingReport.logRejectedTrip();
      return null;
    }

    type AllGood = ((typeof stopTimes)[number] & { stop: StopID })[];
    const combinations = getCombinationsForRouteID(
      config,
      feedConfig,
      trip.route_id,
    );
    const match = matchToRoute(
      config,
      stopTimes as AllGood,
      combinations,
      feedConfig,
    );

    if (match == null) {
      parsingReport.logRejectedRoute((stopTimes as AllGood).map((x) => x.stop));
      parsingReport.logRejectedTrip();
      return null;
    }

    const matchedRoutes = continuationsArray(match);

    for (let i = 0; i < matchedRoutes.length; i++) {
      const matchedRoute = matchedRoutes[i];
      const { line, route, direction, values } = matchedRoute;

      const idPair = {
        gtfsTripID: gtfsTripID,
        gtfsCalendarID: gtfsCalendarID,
        continuationIndex: i,
      };
      const parsedTrip = new GtfsTrip(
        [idPair],
        null,
        new Set(),
        line,
        route,
        direction,
        values,
      );
      const hashKey = parsedTrip.computeHashKey();

      const existing = result.get(hashKey);
      if (existing != null) {
        result.set(hashKey, existing.addIDPair(idPair));
        parsingReport.logMergedTrip();
      } else {
        result.set(hashKey, parsedTrip);
      }
    }
  }

  for (let i = 0; i < rawStopTimes.length; i++) {
    const thisStopTime = rawStopTimes[i];
    if (thisStopTime.trip_id !== trip.trip_id) {
      tripIndex++;
      while (rawTrips[tripIndex].trip_id !== thisStopTime.trip_id) {
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
      stop: feedConfig.stops.get(thisStopTime.stop_id) ?? null,
      gtfsStop: thisStopTime.stop_id,
      value: {
        time: thisStopTime.departure_time,
        sequence: thisStopTime.stop_sequence,
      },
    });
  }
  addResult();

  return dedupeTrips(
    config,
    feedConfig,
    Array.from(result.values()),
    parsingReport,
  );
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
  feedConfig: GtfsFeedConfig,
  trips: GtfsTrip[],
  parsingReport: GtfsParsingReport,
): GtfsTrip[] {
  // DO NOT EDIT THIS FUNCTION... without writing unit tests for it. No actually!

  for (let i = 0; i < trips.length - 1; i++) {
    for (let j = i + 1; j < trips.length; j++) {
      // It might seem like these can be moved to the outer loop, but they
      // can't! The code below can modify the trips array, even at index i!
      const a = trips[i];
      const rules = feedConfig.getParsingRulesForLine(a.line);
      const dedupableLines = new Set([a.line, ...rules.canDedupeWith]);
      const b = trips[j];

      // No point. These trips are all guaranteed to be from the same subfeed.
      // if (a.gtfsSubfeedID !== b.gtfsSubfeedID) {
      //   continue;
      // }

      if (!dedupableLines.has(b.line)) {
        continue;
      }

      const aBounds = determineBoundaryIndices(a.times);
      const bBounds = determineBoundaryIndices(b.times);

      const aStopList = requireLine(config, a.line)
        .route.requireStopList(a.route, a.direction)
        .stops.slice(aBounds.start, aBounds.end + 1);
      const bStopList = requireLine(config, b.line)
        .route.requireStopList(b.route, b.direction)
        .stops.slice(bBounds.start, bBounds.end + 1);
      const aSlice = a.times
        .slice(aBounds.start, aBounds.end + 1)
        .map((t) => t?.time ?? null);
      const bSlice = b.times
        .slice(bBounds.start, bBounds.end + 1)
        .map((t) => t?.time ?? null);

      if (aSlice.length > bSlice.length) {
        if (isSubset(aSlice, bSlice, aStopList, bStopList)) {
          const [newI, newJ] = mergeSubset(a, b);
          trips[i] = newI;
          if (newJ != null) {
            trips[j] = newJ;
            parsingReport.logSplit();
          } else {
            trips.splice(j, 1);
            parsingReport.logDuplicatedTrip();

            // Since we just removed j, the next loop should repeat this j index.
            j--;
          }
        }
      } else {
        if (isSubset(bSlice, aSlice, bStopList, aStopList)) {
          const [newJ, newI] = mergeSubset(b, a);
          trips[j] = newJ;
          if (newI != null) {
            trips[i] = newI;
            parsingReport.logSplit();
          } else {
            trips.splice(i, 1);
            parsingReport.logDuplicatedTrip();

            // Since we just removed i, we should stop iterating this inner loop
            // and start the next outer loop, repeating this index.
            i--;
            break;
          }
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
  // DO NOT EDIT THIS FUNCTION... without writing unit tests for it. No actually!

  for (let start = 0; start <= superset.length - subset.length; start++) {
    let matches = true;
    for (let i = 0; i < subset.length; i++) {
      // Check the stopping orders match.
      if (supersetStops[i + start] !== subsetStops[i]) {
        matches = false;
        break;
      }

      // Check the stopping times match, except for the last stop (arrival times
      // might not match the continuation's departure time).
      if (
        i !== subset.length - 1 &&
        !nullableEquals(superset[i + start], subset[i], (a, b) => a.equals(b))
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

function mergeSubset(
  superset: GtfsTrip,
  subset: GtfsTrip,
): [GtfsTrip, GtfsTrip | null] {
  // TODO: Use known continuation from subset service if available.

  // If the superset trip doesn't run on the same calendars as the subset
  // service, then we can't just remove the subset service entirely! Instead
  // replace it with a trip that only contains those calendars.
  const unaccountedIDPairs = subset.idPairs.filter(
    (p1) =>
      !superset.idPairs.some((p2) => p1.gtfsCalendarID === p2.gtfsCalendarID),
  );
  const vetoedCalendars = superset.idPairs.map((p) => p.gtfsCalendarID);

  const splitSubset =
    unaccountedIDPairs.length === 0
      ? null
      : subset
          .withIDPairs(unaccountedIDPairs)
          .addVetoedCalendars(vetoedCalendars);

  return [superset, splitSubset];
}
