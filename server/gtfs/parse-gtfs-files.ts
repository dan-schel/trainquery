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

export async function parseGtfsFiles(directory: string): Promise<GtfsData> {
  console.log(`Parsing GTFS "${directory}"...`);

  const calendarPath = path.join(directory, "calendar.txt");
  const calendarDatesPath = path.join(directory, "calendar_dates.txt");
  const rawCalendars = await readCsv(calendarPath, calendarSchema);
  const rawCalendarDates = await readCsv(calendarDatesPath, calendarDatesSchema);
  const calendars = parseCalendars(rawCalendars, rawCalendarDates);

  const tripsPath = path.join(directory, "trips.txt");
  const stopTimesPath = path.join(directory, "stop_times.txt");
  const rawTrips = await readCsv(tripsPath, tripsSchema);
  const rawStopTimes = await readCsv(stopTimesPath, stopTimesSchema);
  const trips = parseTrips(rawTrips, rawStopTimes);

  return new GtfsData(calendars, trips);
}

export function parseCalendars(
  rawCalendars: z.infer<typeof calendarSchema>[],
  rawCalendarDates: z.infer<typeof calendarDatesSchema>[]
): GtfsCalendar[] {
  return rawCalendars.map(c => {
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
    const additionalDates = rawCalendarDates.filter(d => d.service_id == c.service_id && d.exception_type == "added").map(d => d.date);
    const exceptions = rawCalendarDates.filter(d => d.service_id == c.service_id && d.exception_type == "removed").map(d => d.date);
    return new GtfsCalendar(gtfsCalendarID, null, wdr, start, end, additionalDates, exceptions);
  });
}

export function parseTrips(
  rawTrips: z.infer<typeof tripsSchema>[],
  rawStopTimes: z.infer<typeof stopTimesSchema>[]
): GtfsTrip[] {
  return rawTrips.map(t => {
    const gtfsTripID = t.trip_id;
    const gtfsCalendarID = t.service_id;

    const stopTimes = rawStopTimes.filter(s => s.trip_id == t.trip_id).sort((a, b) => a.stop_sequence - b.stop_sequence);
    const match = matchToRoute(stopTimes.map(s => ({
      // TODO: Map GTFS stop IDs to TrainQuery ones.
      stop: matchToStop(s.stop_id),
      value: s.departure_time
    })));

    if (match == null) {
      throw new Error("GTFS entry has stopping pattern which matches no known routes.");
    }
    const { line, associatedLines, route, direction } = match;
    const times = match.values;

    return new GtfsTrip(gtfsTripID, null, gtfsCalendarID, line, associatedLines, route, direction, times);
  });
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
