import { QDate } from "../../qtime/qdate";
import { QTimetableTime } from "../../qtime/qtime";
import { QWeekdayRange } from "../../qtime/qweekdayrange";
import {
  type DirectionID,
  type LineID,
  type RouteVariantID,
  type StopID,
  type TimetableID,
} from "../ids";

export class Timetable {
  constructor(
    /** Uniquely identifies this timetable from others in the system. */
    readonly id: TimetableID,
    /** Which line this timetable specifies services for. */
    readonly line: LineID,
    /** If true, this timetable overrides regular timetables during its time-frame. */
    readonly isTemporary: boolean,
    /** When this timetable goes into effect, if known. */
    readonly begins: QDate | null,
    /** The last day of operation according to this timetable, if known. */
    readonly ends: QDate | null,
    /** The date the timetable was created. */
    readonly created: QDate,
    /** The services in the timetable. */
    readonly entries: TimetableEntry[]
  ) {}
}

export class TimetableEntry {
  constructor(
    /** Which route variant this service takes. */
    readonly route: RouteVariantID,
    /** Which direction this service travels in. */
    readonly direction: DirectionID,
    /** Which days of the week this services operates on. */
    readonly weekdayRange: QWeekdayRange,
    /** The times of each stop this service makes. */
    readonly stops: TimetabledStop[]
  ) {}
}

export class TimetabledStop {
  constructor(
    /** The stop in question. */
    readonly stop: StopID,
    /** The time the service stops at the aforementioned stop. */
    readonly time: QTimetableTime
  ) {}
}
