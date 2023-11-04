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

  abstract getUnfiltered(
    time: QUtcDateTime,
    iteration: number,
    reverse: boolean,
  ): T[];
}
