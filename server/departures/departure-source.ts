import { QDate } from "../../shared/qtime/qdate";
import { QTimetableTime } from "../../shared/qtime/qtime";
import { StopID } from "../../shared/system/ids";
import { TrainQuery } from "../trainquery";

export type SearchTimeRange = {
  /** The timetabled date to search within. */
  date: QDate;
  min: QTimetableTime | null;
  max: QTimetableTime | null;
  /**
   * Converts the timetabled time to a time value that can be used to sorting
   * (ideally resembles UTC to sort services from days with different offsets
   * correctly, but only has to worry about sorting within the same iteration).
   */
  getSortTime: (time: QTimetableTime) => number;
};

export abstract class DepartureSource<T> {
  constructor(private readonly _ctx: TrainQuery) {}

  /**
   * Prepares the DepartureSource for queries from a particular stop. Allows it
   * to cache details about this stop in advance, assuming they will be used
   * repetitively.
   */
  abstract setStop(stop: StopID): void;

  abstract getUnfiltered(searchTime: SearchTimeRange): T;
}
