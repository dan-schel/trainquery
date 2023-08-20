import { QDate } from "./qdate";
import { QTime } from "./qtime";

export abstract class QDateTime<T extends QDateTime<T>> {
  constructor(readonly date: QDate, readonly time: QTime) {
    this.date = date;
    this.time = time;
  }
  /** E.g. 145900 for 2:59pm. */
  asDecimal(): number {
    // Beware: Assuming 4 digit years, this number gets close to the maximum
    // "safe" integer, which is 9007199254740991.
    // 8 digits for the date:     XXXXXXXX
    // 6 digits for the time:             XXXXXX

    return this.date.asDecimal() * 1000000 + this.time.asDecimal();
  }
  /** E.g. "2023-08-15T10:46:00Z" or "2023-08-15T20:46:00+10:00" */
  abstract toISO(): string;
  /** Adds `d` days, `h` hours, `m` minutes, and `s` seconds. `d`/`h`/`m`/`s` can be negative. */
  abstract add(units: { d: number; h: number; m: number; s: number }): T;

  equals(other: QTime) {
    return this.asDecimal() == other.asDecimal();
  }
  isBefore(other: QTime) {
    return this.asDecimal() < other.asDecimal();
  }
  isBeforeOrEqual(other: QTime) {
    return this.asDecimal() <= other.asDecimal();
  }
  isAfter(other: QTime) {
    return this.asDecimal() > other.asDecimal();
  }
  isAfterOrEqual(other: QTime) {
    return this.asDecimal() >= other.asDecimal();
  }
}
export class QUtcDateTime extends QDateTime<QUtcDateTime> {
  toISO(): string {
    return `${this.date.toISO()}T${this.time.toISO()}Z`;
  }
  add({
    d,
    h,
    m,
    s,
  }: {
    d: number;
    h: number;
    m: number;
    s: number;
  }): QUtcDateTime {
    const result = this.time.add({ h, m, s });
    return new QUtcDateTime(this.date.addDays(result.days + d), result.time);
  }
}
