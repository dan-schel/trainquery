import { QDate } from "../../qtime/qdate";
import { QTimetableTime } from "../../qtime/qtime";
import { QWeekdayRange } from "../../qtime/qweekdayrange";
import {
  type DirectionID,
  type LineID,
  type RouteVariantID,
  type TimetableID,
} from "../ids";

export class Timetable {
  readonly entries: FullTimetableEntry[];

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
    entries: TimetableEntry[]
  ) {
    this.entries = entries.map(
      (e, i) =>
        new FullTimetableEntry(
          id,
          line,
          i,
          e.route,
          e.direction,
          e.weekdayRange,
          e.rows
        )
    );
  }
}

export class TimetableEntry {
  constructor(
    /** Which route variant this service takes. */
    readonly route: RouteVariantID,
    /** Which direction this service travels in. */
    readonly direction: DirectionID,
    /** Which days of the week this services operates on. */
    readonly weekdayRange: QWeekdayRange,
    /** The value of each row (either the time, or null if it doesn't stop). */
    readonly rows: (QTimetableTime | null)[]
  ) {}
}

export class FullTimetableEntry extends TimetableEntry {
  constructor(
    /** The ID of the timetable which this entry came from. */
    readonly id: TimetableID,
    /** The line of the timetable this entry comes from to. */
    readonly line: LineID,
    /** The index of the entry within its timetable. */
    readonly entryIndex: number,
    /** Which route variant this service takes. */
    route: RouteVariantID,
    /** Which direction this service travels in. */
    direction: DirectionID,
    /** Which days of the week this services operates on. */
    weekdayRange: QWeekdayRange,
    /** The value of each row (either the time, or null if it doesn't stop). */
    rows: (QTimetableTime | null)[]
  ) {
    super(route, direction, weekdayRange, rows);
  }
}
