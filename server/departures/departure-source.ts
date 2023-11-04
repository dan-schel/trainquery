import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../shared/system/ids";
import { TrainQuery } from "../trainquery";

export abstract class DepartureSource<T> {
  constructor(protected readonly _ctx: TrainQuery) {}

  /**
   * Prepares the DepartureSource for queries from a particular stop. Allows it
   * to cache details about this stop in advance, assuming they will be used
   * repetitively.
   */
  abstract prepare(stop: StopID, filterLines: LineID[] | null): void;

  /**
   * Returns departures from this source. The result can be in raw form, as
   * departures undergo another "specificizing" step once filtered.
   * @param time The time to query departures for.
   * @param iteration The iteration (see getDepartures implementation).
   * @param reverse True if we want departures before this time, not after.
   */
  abstract fetch(
    time: QUtcDateTime,
    iteration: number,
    reverse: boolean,
  ): Promise<T[]>;

  /**
   * True if getDepartures should call fetch repeatedly until it has as many
   * departures as it desires, or false if fetch will return all possible
   * departures immediately.
   */
  abstract isIterable(): boolean;
}
