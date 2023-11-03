import { QDate } from "../../shared/qtime/qdate";
import { StopID } from "../../shared/system/ids";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { DepartureSource, SearchTimeRange } from "./departure-source";

export type Possibility = {
  entry: FullTimetableEntry;
  date: QDate;
  perspectiveIndex: number;
};

export class TimetableDepartureSource extends DepartureSource<Possibility> {
  setStop(stop: StopID): void {
    throw new Error("Method not implemented.");
  }

  getUnfiltered(searchTime: SearchTimeRange): Possibility {
    throw new Error("Method not implemented.");
  }
}
