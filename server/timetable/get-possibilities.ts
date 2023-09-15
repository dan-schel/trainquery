import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { QDayOfWeek } from "../../shared/qtime/qdayofweek";
import { QTimetableTime, QTime } from "../../shared/qtime/qtime";
import { requireLine } from "../../shared/system/config-utils";
import {
  StopID,
  LineID,
  RouteVariantID,
  DirectionID,
} from "../../shared/system/ids";
import { badVariantOrDirection } from "../../shared/system/routes/line-route";
import { TimetableEntry } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";
import { getTimetablesForDay } from "./get-timetables-for-day";

export type Possibility = {
  entry: TimetableEntry;
  date: QDate;
  perspectiveIndex: number;
};

export function getPossibilities(
  ctx: TrainQuery,
  stop: StopID,
  time: QUtcDateTime,
  iteration: number,
  reverse: boolean,
  lines: LineID[]
): Possibility[] {
  const result: (Possibility & { time: QTime })[] = [];

  // Iterate through every range of timetable times that occur at the time we're
  // interested in (we should also consider >03:00 on Monday night for 3:00am
  // Tuesday).
  const searchTimes = getSearchTimes(time, iteration, reverse);
  for (const searchTime of searchTimes) {
    const dow = QDayOfWeek.fromDate(searchTime.date);

    // Iterate through every timetable that operates on this day (on the
    // relevant lines)...
    const timetables = getTimetablesForDay(ctx, searchTime.date, lines);
    for (const timetable of timetables) {
      const line = requireLine(ctx.getConfig(), timetable.line);
      const stopLists = line.route.getStopLists().map((l) => ({
        variant: l.variant,
        direction: l.direction,
        indices: l.stops
          .map((e, i) => ({ stop: e, index: i }))
          .filter((e) => e.stop == stop)
          .map((e) => e.index),
      }));

      // Iterate through every service in the timetable...
      for (const entry of timetable.entries) {
        if (!entry.weekdayRange.includes(dow)) {
          continue;
        }

        // Iterate through every time the service stops at this stop...
        const indices = retrieveIndices(
          stopLists,
          entry.route,
          entry.direction
        );
        for (const index of indices) {
          const time = entry.rows[index];
          if (time == null || !isWithin(time, searchTime.min, searchTime.max)) {
            continue;
          }

          result.push({
            entry: entry,
            date: searchTime.date,
            time: searchTime.toTimeInDay(time),
            perspectiveIndex: index,
          });
        }
      }
    }
  }

  result.sort(
    (a, b) => (reverse ? -1 : 1) * (a.time.asDecimal() - b.time.asDecimal())
  );
  return result;
}

function retrieveIndices(
  stopLists: {
    variant: RouteVariantID;
    direction: DirectionID;
    indices: number[];
  }[],
  variant: RouteVariantID,
  direction: DirectionID
) {
  const result = stopLists.find(
    (l) => l.variant == variant && l.direction == direction
  );
  if (result == null) {
    throw badVariantOrDirection(variant, direction);
  }
  return result.indices;
}

type SearchTimeRange = {
  /** The timetabled date to search within. */
  date: QDate;
  min: QTimetableTime | null;
  max: QTimetableTime | null;
  /** Converts the timetabled time to the time within the day in question. */
  toTimeInDay: (time: QTimetableTime) => QTime;
};

function getSearchTimes(
  time: QUtcDateTime,
  iteration: number,
  reverse: boolean
): SearchTimeRange[] {
  // TODO: Actually do it!
  return [];
}

function isWithin(
  time: QTimetableTime,
  start: QTimetableTime | null,
  end: QTimetableTime | null
) {
  if (start != null && time.isBefore(start)) {
    return false;
  }
  if (end != null && time.isAfterOrEqual(end)) {
    return false;
  }
  return true;
}
