import path from "path";
import fs from "fs";
import { GtfsData } from "./gtfs-data";
import csvParser from "csv-parser";
import { z } from "zod";
import {
  calendarDatesSchema,
  calendarSchema,
  stopTimesSchema,
  tripsSchema,
} from "./gtfs-csv-schemas";

export async function parseGtfsFiles(directory: string): Promise<GtfsData> {
  console.log(`Parsing GTFS "${directory}"...`);

  const stopTimesPath = path.join(directory, "stop_times.txt");
  const stopTimes = await readCsv(stopTimesPath, stopTimesSchema);

  const tripsPath = path.join(directory, "trips.txt");
  const trips = await readCsv(tripsPath, tripsSchema);

  const calendarPath = path.join(directory, "calendar.txt");
  const calendar = await readCsv(calendarPath, calendarSchema);

  const calendarDatesPath = path.join(directory, "calendar_dates.txt");
  const calendarDates = await readCsv(calendarDatesPath, calendarDatesSchema);

  console.log(`Read ${stopTimes.length} stop times and ${trips.length} trips.`);

  return new GtfsData();
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
