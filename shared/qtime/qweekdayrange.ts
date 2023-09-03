import { QDayOfWeek } from "./qdayofweek";

export class QWeekdayRange {
  constructor(
    readonly mon: boolean,
    readonly tue: boolean,
    readonly wed: boolean,
    readonly thu: boolean,
    readonly fri: boolean,
    readonly sat: boolean,
    readonly sun: boolean,
  ) { }

  toString() {
    return (
      (this.mon ? "M" : "_") +
      (this.tue ? "T" : "_") +
      (this.wed ? "W" : "_") +
      (this.thu ? "T" : "_") +
      (this.fri ? "F" : "_") +
      (this.sat ? "S" : "_") +
      (this.sun ? "S" : "_")
    );
  }

  includes(day: QDayOfWeek): boolean {
    return (
      (day.equals(QDayOfWeek.mon) && this.mon) ||
      (day.equals(QDayOfWeek.tue) && this.tue) ||
      (day.equals(QDayOfWeek.wed) && this.wed) ||
      (day.equals(QDayOfWeek.thu) && this.thu) ||
      (day.equals(QDayOfWeek.fri) && this.fri) ||
      (day.equals(QDayOfWeek.sat) && this.sat) ||
      (day.equals(QDayOfWeek.sun) && this.sun)
    );
  }
}
