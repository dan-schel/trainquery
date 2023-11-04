import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { StopID } from "../../shared/system/ids";
import { GtfsTrip } from "../gtfs/gtfs-data";
import { TrainQuery } from "../trainquery";
import { DepartureSource } from "./departure-source";
import { SearchTimeRange, fetchAndSort } from "./search-time-range";

export type GtfsPossibility = {
  trip: GtfsTrip;
  gtfsCalendarID: string;
  date: QDate;
  perspectiveIndex: number;
};

export class GtfsDepartureSource extends DepartureSource<GtfsPossibility> {
  private _stop: StopID | null = null;

  prepare(stop: StopID): void {
    this._stop = stop;
  }
  async fetch(
    time: QUtcDateTime,
    iteration: number,
    reverse: boolean,
  ): Promise<GtfsPossibility[]> {
    if (this._stop == null) {
      throw new Error("Call prepare before fetch.");
    }
    const stop = this._stop;

    return await fetchAndSort(this._ctx, time, iteration, reverse, async (t) =>
      getForSearchTime(this._ctx, stop, t),
    );
  }

  isIterable(): boolean {
    return true;
  }
}

function getForSearchTime(
  ctx: TrainQuery,
  stop: StopID,
  searchTime: SearchTimeRange,
) {
  const result: (GtfsPossibility & { sortTime: number })[] = [];

  return result;
}
