import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../shared/system/ids";
import { DepartureSource } from "../departures/departure-source";

export abstract class Bucket<A, B> {
  abstract willAccept(possibility: A): boolean;
  abstract push(service: B): void;
  abstract isFull(): boolean;
}

export type Specificizer<A, B> = (entry: A) => B;

export async function getDepartures<A, B>(
  source: DepartureSource<A>,
  stop: StopID,
  time: QUtcDateTime,
  buckets: Bucket<A, B>[],
  specificizer: Specificizer<A, B>,
  {
    reverse = false,
    maxIteration = 14,
  }: {
    reverse?: boolean;
    filterLines?: LineID[] | null;
    maxIteration?: number;
  } = {},
) {
  source.prepare(stop);

  let iteration = 0;
  while (
    iteration <= maxIteration &&
    !buckets.every((b) => b.isFull()) &&
    (iteration === 0 || source.isIterable())
  ) {
    const possibilities = await source.fetch(time, iteration, reverse);

    for (const possibility of possibilities) {
      // Determine which buckets (if any) want this departure.
      const approvingBuckets = buckets.filter(
        (b) => !b.isFull() && b.willAccept(possibility),
      );
      if (approvingBuckets.length > 0) {
        // This operation is treated as being potentially expensive, which is
        // why buckets are encouraged to filter first on the possibility.
        const specificized = specificizer(possibility);
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
