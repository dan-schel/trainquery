import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { QDayOfWeek } from "../../shared/qtime/qdayofweek";
import { linesThatStopAt, requireLine } from "../../shared/system/config-utils";
import {
  DirectionID,
  LineID,
  RouteVariantID,
  StopID,
} from "../../shared/system/ids";
import { badVariantOrDirection } from "../../shared/system/routes/line-route";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { isWithin } from "../../shared/utils";
import { getTimetablesForDay } from "../timetable/get-timetables-for-day";
import { TrainQuery } from "../trainquery";
import { DepartureSource } from "./departure-source";
import { SearchTimeRange, getSearchTimes } from "./search-time-range";

export type Possibility = {
  entry: FullTimetableEntry;
  date: QDate;
  perspectiveIndex: number;
};

export class TimetableDepartureSource extends DepartureSource<Possibility> {
  private _stop: StopID | null = null;
  private _lines: LineID[] | null = null;

  prepare(stop: StopID, filterLines: LineID[] | null): void {
    this._stop = stop;

    const stoppingLines = linesThatStopAt(this._ctx.getConfig(), stop).map(
      (l) => l.id,
    );
    this._lines =
      filterLines == null
        ? stoppingLines
        : stoppingLines.filter((f) => filterLines.includes(f));
  }

  getUnfiltered(
    time: QUtcDateTime,
    iteration: number,
    reverse: boolean,
  ): Possibility[] {
    if (this._stop == null || this._lines == null) {
      throw new Error("Call setStop before getUnfiltered.");
    }
    const stop = this._stop;
    const lines = this._lines;

    const searchTimes = getSearchTimes(this._ctx, time, iteration, reverse);
    const result = searchTimes
      .map((t) => getForSearchTime(this._ctx, stop, lines, t))
      .flat();
    result.sort((a, b) => (reverse ? -1 : 1) * (a.sortTime - b.sortTime));

    return result;
  }
}

function getForSearchTime(
  ctx: TrainQuery,
  stop: StopID,
  lines: LineID[],
  searchTime: SearchTimeRange,
) {
  const result: (Possibility & { sortTime: number })[] = [];

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
      const indices = retrieveIndices(stopLists, entry.route, entry.direction);
      for (const index of indices) {
        const time = entry.rows[index];
        if (time == null || !isWithin(time, searchTime.min, searchTime.max)) {
          continue;
        }

        result.push({
          entry: entry,
          date: searchTime.date,
          sortTime: searchTime.getSortTime(time),
          perspectiveIndex: index,
        });
      }
    }
  }

  return result;
}

function retrieveIndices(
  stopLists: {
    variant: RouteVariantID;
    direction: DirectionID;
    indices: number[];
  }[],
  variant: RouteVariantID,
  direction: DirectionID,
) {
  const result = stopLists.find(
    (l) => l.variant == variant && l.direction == direction,
  );
  if (result == null) {
    throw badVariantOrDirection(variant, direction);
  }
  return result.indices;
}
