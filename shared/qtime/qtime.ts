import { parseIntThrow, posMod } from "@dan-schel/js-utils";
import { type InformalDuration, QDuration } from "./qduration";
import { z } from "zod";
import { QDate } from "./qdate";
import { QLocalDateTime } from "./qdatetime";

export abstract class QTimeBase<T extends QTimeBase<T>> {
  constructor(
    readonly hour: number,
    readonly minute: number,
    readonly second: number,
  ) {}

  protected abstract _getNumOfHours(): number;

  isValid(): { valid: true } | { valid: false; issue: string } {
    const invalid = (issue: string) => ({ valid: false, issue: issue });

    if (
      !Number.isInteger(this.hour) ||
      this.hour < 0 ||
      this.hour >= this._getNumOfHours()
    ) {
      return invalid(`"${this.hour}" is not a valid hour.`);
    }
    if (!Number.isInteger(this.minute) || this.minute < 0 || this.minute > 59) {
      return invalid(`"${this.minute}" is not a valid minute.`);
    }
    if (!Number.isInteger(this.second) || this.second < 0 || this.second > 59) {
      return invalid(`"${this.second}" is not a valid second.`);
    }

    return { valid: true };
  }
  /** E.g. 145900 for 2:59pm. */
  asDecimal(): number {
    return this.hour * 10000 + this.minute * 100 + this.second;
  }

  equals(other: T) {
    return this.asDecimal() === other.asDecimal();
  }
  isBefore(other: T) {
    return this.asDecimal() < other.asDecimal();
  }
  isBeforeOrEqual(other: T) {
    return this.asDecimal() <= other.asDecimal();
  }
  isAfter(other: T) {
    return this.asDecimal() > other.asDecimal();
  }
  isAfterOrEqual(other: T) {
    return this.asDecimal() >= other.asDecimal();
  }

  /** True if this time is within min (inclusive) and max (exclusive). */
  isWithin(
    min: T | null,
    max: T | null,
    { maxInclusive = false }: { maxInclusive?: boolean } = {},
  ) {
    if (min != null && this.isBefore(min)) {
      return false;
    }
    if (
      max != null &&
      (maxInclusive ? this.isAfter(max) : this.isAfterOrEqual(max))
    ) {
      return false;
    }
    return true;
  }

  startOfMinute() {
    return new QTime(this.hour, this.minute, 0);
  }
}

export class QTime extends QTimeBase<QTime> {
  constructor(hour: number, minute: number, second: number) {
    super(hour, minute, second);
  }

  _getNumOfHours(): number {
    return 24;
  }

  /** E.g. "14:59:00" for 2:59pm. */
  toISO() {
    const h = this.hour.toFixed().padStart(2, "0");
    const m = this.minute.toFixed().padStart(2, "0");
    const s = this.second.toFixed().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  static readonly json = z.string().transform((x, ctx) => {
    const result = QTime.parse(x);
    if (result == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a time.",
      });
      return z.NEVER;
    }
    return result;
  });

  /**
   * Add `h` hours, `m` minutes, and `s` seconds to this time. `h`/`m`/`s` can
   * be negative.
   */
  add(duration: InformalDuration): {
    time: QTime;
    days: number;
  } {
    const currSeconds = this.hour * 60 * 60 + this.minute * 60 + this.second;
    const addSeconds = QDuration.formalize(duration).inSecs;
    if (!Number.isInteger(addSeconds)) {
      throw new Error(`Must add an integer number of seconds.`);
    }

    let days = 0;
    let newValue = currSeconds + addSeconds;
    while (newValue >= 24 * 60 * 60) {
      days += 1;
      newValue -= 24 * 60 * 60;
    }
    while (newValue < 0) {
      days -= 1;
      newValue += 24 * 60 * 60;
    }

    const hour = Math.floor(newValue / 60 / 60);
    const minute = Math.floor(newValue / 60) % 60;
    const second = newValue % 60;

    return { time: new QTime(hour, minute, second), days: days };
  }

  diffSeconds(other: QTime) {
    const thisSeconds = this.hour * 60 * 60 + this.minute * 60 + this.second;
    const otherSeconds =
      other.hour * 60 * 60 + other.minute * 60 + other.second;
    return thisSeconds - otherSeconds;
  }

  /** Accepts "09:45", "14:55:32", etc. Does not check for time validity. */
  static parse(input: string): QTime | null {
    if (!/^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$/.test(input)) {
      return null;
    }
    const numbers = input.split(":").map((x) => parseIntThrow(x));
    return new QTime(numbers[0], numbers[1], numbers[2] ?? 0);
  }

  toJSON(): z.input<typeof QTime.json> {
    return this.toISO();
  }
}

export class QTimetableTime extends QTimeBase<QTimetableTime> {
  constructor(hour: number, minute: number, second: number) {
    super(hour, minute, second);
  }

  static getNumOfHours(): number {
    // NOTE: This limits services to only be able to span over two days.
    // getDepartures() is written to support services that might span more than
    // two days, so this could be expanded in future, we'd just need to come up
    // with some way of representing them as strings (maybe ">>00:45" could mean
    // 12:45am on the third day?).
    return 48;
  }

  _getNumOfHours(): number {
    return QTimetableTime.getNumOfHours();
  }

  /** Returns 0 if `hour < 24` and 1 otherwise. */
  get day() {
    return Math.floor(this.hour / 24);
  }

  static readonly json = z.string().transform((x, ctx) => {
    const result = QTimetableTime.parse(x);
    if (result == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not an timetable time.",
      });
      return z.NEVER;
    }
    return result;
  });

  /**
   * Add `h` hours, `m` minutes, and `s` seconds to this time. `h`/`m`/`s` can
   * be negative.
   */
  add(duration: InformalDuration): QTimetableTime | null {
    const currSeconds = this.hour * 60 * 60 + this.minute * 60 + this.second;
    const addSeconds = QDuration.formalize(duration).inSecs;
    if (!Number.isInteger(addSeconds)) {
      throw new Error(`Must add an integer number of seconds.`);
    }
    const newValue = currSeconds + addSeconds;

    if (newValue < 0 || newValue >= 48 * 60 * 60) {
      return null;
    }

    const hour = Math.floor(newValue / 60 / 60);
    const minute = Math.floor(newValue / 60) % 60;
    const second = newValue % 60;
    return new QTimetableTime(hour, minute, second);
  }

  /** Accepts ">09:45", "14:55:32", etc. */
  static parse(input: string): QTimetableTime | null {
    const timeBit = input.startsWith(">") ? input.slice(1) : input;
    const time = QTime.parse(timeBit);
    if (time == null) {
      return null;
    }
    return new QTimetableTime(
      time.hour + (input.startsWith(">") ? 24 : 0),
      time.minute,
      time.second,
    );
  }

  /**
   * Creates a timetable time by considering the duration of a given datetime
   * from a particular date. Returns null if the datetime occurs before the date,
   * since timetable times cannot be negative.
   */
  static fromDateTime(
    date: QDate,
    dateTime: QLocalDateTime,
  ): QTimetableTime | null {
    if (dateTime.date.isBefore(date)) {
      return null;
    }
    const days = dateTime.date.diff(date);
    return new QTimetableTime(
      dateTime.time.hour + days * 24,
      dateTime.time.minute,
      dateTime.time.second,
    );
  }

  static fromDuration(duration: QDuration): QTimetableTime | null {
    const { d, h, m, s } = duration.components;
    return new QTimetableTime(0, 0, 0).add({
      h: d * 24 + h,
      m: m,
      s: s,
    });
  }

  toTtblString(includeSeconds: boolean) {
    const h = posMod(this.hour, 24).toFixed().padStart(2, "0");
    const m = this.minute.toFixed().padStart(2, "0");
    const timeString = `${this.hour < 24 ? "" : ">"}${h}:${m}`;
    if (!includeSeconds) {
      return timeString;
    }
    const s = this.second.toFixed().padStart(2, "0");
    return `${timeString}:${s}`;
  }

  toJSON(): z.input<typeof QTimetableTime.json> {
    return this.toTtblString(this.second !== 0);
  }
}
