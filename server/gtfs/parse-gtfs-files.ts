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
import { matchToRoute } from "../../shared/system/routes/find-match";
import { StopID } from "../../shared/system/ids";
import { TrainQuery } from "../trainquery";
import { requireStop } from "../../shared/system/config-utils";
import { QTimetableTime } from "../../shared/qtime/qtime";

export async function parseGtfsFiles(
  ctx: TrainQuery,
  directory: string,
  stopMap: Map<number, StopID>,
): Promise<GtfsData> {
  console.log(`Parsing GTFS "${directory}"...`);

  const calendarPath = path.join(directory, "calendar.txt");
  const calendarDatesPath = path.join(directory, "calendar_dates.txt");
  const rawCalendars = await readCsv(calendarPath, calendarSchema);
  const rawCalendarDates = await readCsv(
    calendarDatesPath,
    calendarDatesSchema
  );
  const calendars = parseCalendars(rawCalendars, rawCalendarDates);

  const tripsPath = path.join(directory, "trips.txt");
  const stopTimesPath = path.join(directory, "stop_times.txt");
  const rawTrips = await readCsv(tripsPath, tripsSchema);
  const rawStopTimes = await readCsv(stopTimesPath, stopTimesSchema);
  const trips = parseTrips(ctx, rawTrips, rawStopTimes, stopMap);

  console.log(`Done! (Got ${trips.length} trips from a possible ${rawTrips.length})`);
  return new GtfsData(calendars, trips);
}

function parseCalendars(
  rawCalendars: z.infer<typeof calendarSchema>[],
  rawCalendarDates: z.infer<typeof calendarDatesSchema>[]
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
      c.sunday
    );
    const start = c.start_date;
    const end = c.end_date;
    const additionalDates = rawCalendarDates
      .filter(
        (d) => d.service_id == c.service_id && d.exception_type == "added"
      )
      .map((d) => d.date);
    const exceptions = rawCalendarDates
      .filter(
        (d) => d.service_id == c.service_id && d.exception_type == "removed"
      )
      .map((d) => d.date);
    return new GtfsCalendar(
      gtfsCalendarID,
      null,
      wdr,
      start,
      end,
      additionalDates,
      exceptions
    );
  });
}

function parseTrips(
  ctx: TrainQuery,
  rawTrips: z.infer<typeof tripsSchema>[],
  rawStopTimes: z.infer<typeof stopTimesSchema>[],
  stopMap: Map<number, StopID>,
): GtfsTrip[] {
  rawTrips.sort((a, b) => a.trip_id.localeCompare(b.trip_id));
  rawStopTimes.sort((a, b) => a.trip_id.localeCompare(b.trip_id));

  const result: GtfsTrip[] = [];

  let thisTrip: { stop: number | null, gtfsStop: number, value: QTimetableTime }[] = [];
  let tripIndex = 0;
  let trip = rawTrips[tripIndex];

  function addResult() {
    const gtfsTripID = trip.trip_id;
    const gtfsCalendarID = trip.service_id;
    const stopTimes = thisTrip;

    const unknownStops = stopTimes.filter(e => e.stop == null);
    if (unknownStops.length != 0) {
      // TODO: Report unknown stops properly!
      for (const unknownStop of unknownStops) {
        console.warn(`[GTFS REPORT]: Unknown stop "${unknownStop.gtfsStop}".`);
      }
      return null;
    }

    type AllGood = (typeof stopTimes[number] & { stop: StopID })[];
    const match = matchToRoute(ctx.getConfig(), stopTimes as AllGood);

    if (match == null) {
      // TODO: Report unknown route properly!
      // TODO: Don't report duplicates (probably good to check for duplicates in
      // reverse order since they tend to duplicate the previous entry).
      const stopNames = (stopTimes as AllGood).map((s) => requireStop(ctx.getConfig(), s.stop).name);
      console.warn(`[GTFS REPORT]: Unknown route ${stopNames.join(" → ")}.`);
      return null;
    }
    const { line, associatedLines, route, direction } = match;
    const times = match.values;

    result.push(new GtfsTrip(
      gtfsTripID,
      null,
      gtfsCalendarID,
      line,
      associatedLines,
      route,
      direction,
      times
    ));
  }

  for (let i = 0; i < rawStopTimes.length; i++) {
    const thisStopTime = rawStopTimes[i];
    if (thisStopTime.trip_id != trip.trip_id) {
      tripIndex++;
      while (rawTrips[tripIndex].trip_id != thisStopTime.trip_id) {
        tripIndex++;
        if (tripIndex >= rawTrips.length) {
          throw new Error("Trips mentioned in stop_times.txt are not present in trips.txt.");
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

  return result;
}

async function readCsv<T extends z.ZodType>(
  path: string,
  schema: T
): Promise<z.infer<T>[]> {
  return await new Promise((resolve) => {
    const results: z.infer<T>[] = [];
    fs.createReadStream(path)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim(),
        })
      )
      .on("data", (row) => {
        results.push(schema.parse(row));
      })
      .on("end", () => {
        resolve(results);
      });
  });
}
