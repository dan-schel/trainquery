import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { linesThatStopAt } from "../../shared/system/config-utils";
import { LineID, StopID } from "../../shared/system/ids";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";
import { Possibility, getPossibilities as gp } from "./get-possibilities";

export abstract class Bucket<T> {
  abstract willAccept(possibility: Possibility): boolean;
  abstract push(service: T): void;
  abstract isFull(): boolean;
}

export type Specificizer<T> = (
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate,
  perspectiveIndex: number
) => T;

export function getDepartures<T>(
  ctx: TrainQuery,
  stop: StopID,
  time: QUtcDateTime,
  buckets: Bucket<T>[],
  specificizer: Specificizer<T>,
  {
    reverse = false,
    filterLines = null,
    maxIteration = 14,
  }: {
    reverse?: boolean;
    filterLines?: LineID[] | null;
    maxIteration?: number;
  } = {}
) {
  const lines = getRelevantLines(ctx, stop, filterLines);
  const getPossibilities = (iteration: number) =>
    gp(ctx, stop, time, iteration, reverse, lines);

  let iteration = 0;

  while (iteration <= maxIteration && !buckets.every((b) => b.isFull())) {
    const possibilities = getPossibilities(iteration);

    for (const possibility of possibilities) {
      // Determine which buckets (if any) want this departure.
      const approvingBuckets = buckets.filter(
        (b) => !b.isFull() && b.willAccept(possibility)
      );
      if (approvingBuckets.length > 0) {
        // This operation is treated as being potentially expensive, which is
        // why buckets are encouraged to filter first on the possibility.
        const specificized = specificizer(
          ctx,
          possibility.entry,
          possibility.date,
          possibility.perspectiveIndex
        );
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
