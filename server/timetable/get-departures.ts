import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { QTimetableTime } from "../../shared/qtime/qtime";
import { linesThatStopAt } from "../../shared/system/config-utils";
import { LineID, StopID } from "../../shared/system/ids";
import { TimetableEntry } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";

type SearchTimeRange = {
  date: QDate;
  min: QTimetableTime;
  max: QTimetableTime | null;
};

type Possibility = {
  entry: TimetableEntry;
  date: QDate;
};

export abstract class Bucket<T> {
  abstract willAccept(possibility: Possibility): boolean;
  abstract push(service: T): void;
  abstract isFull(): boolean;
}

export type Specificizer<T> = (entry: TimetableEntry, date: QDate) => T;

export function getDeparture<T>(
  ctx: TrainQuery,
  stop: StopID,
  time: QUtcDateTime,
  buckets: Bucket<T>[],
  specificizer: Specificizer<T>,
  options?: { reverse?: boolean; filterLines?: LineID[]; maxIteration?: number }
) {
  const reverse = options?.reverse ?? false;
  const filterLines = options?.filterLines ?? null;
  const maxIteration = options?.maxIteration ?? 14;

  const lines = getRelevantLines(ctx, stop, filterLines);
  const _getPossibilities = (iteration: number) =>
    getPossibilities(ctx, stop, time, iteration, reverse, lines);

  let iteration = 0;

  while (iteration <= maxIteration && !buckets.every((b) => b.isFull())) {
    const possibilities = _getPossibilities(iteration);

    for (const possibility of possibilities) {
      // Determine which buckets (if any) want this departure.
      const approvingBuckets = buckets.filter(
        (b) => !b.isFull() && b.willAccept(possibility)
      );
      if (approvingBuckets.length > 1) {
        // This operation is treated as being potentially expensive, which is
        // why buckets are encouraged to filter first on the possibility.
        const specificized = specificizer(possibility.entry, possibility.date);
        approvingBuckets.forEach((b) => b.push(specificized));
      }

      // Stop early if every bucket is full.
      if (buckets.every((b) => b.isFull())) {
        break;
      }
    }

    iteration++;
  }
}

function getRelevantLines(
  ctx: TrainQuery,
  stop: StopID,
  filterLines: LineID[] | null
) {
  const stoppingLines = linesThatStopAt(ctx.getConfig(), stop).map((l) => l.id);
  if (filterLines == null) {
    return stoppingLines;
  }
  return stoppingLines.filter((f) => filterLines.includes(f));
}

function getPossibilities(
  ctx: TrainQuery,
  stop: StopID,
  time: QUtcDateTime,
  iteration: number,
  reverse: boolean,
  lines: LineID[]
): Possibility[] {
  const searchTimes = getTimetableTimes(time, iteration, reverse);

  // TODO: Actually do it!
  return [];
}

function getTimetableTimes(
  utc: QUtcDateTime,
  iteration: number,
  reverse: boolean
): SearchTimeRange[] {
  // TODO: Actually do it!
  return [];
}
