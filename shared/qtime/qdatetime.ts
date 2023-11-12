import { z } from "zod";
import { QDate } from "./qdate";
import { QTime, QTimetableTime } from "./qtime";
import { type InformalDuration, QDuration } from "./qduration";

export abstract class QDateTime<T extends QDateTime<T>> {
  constructor(
    readonly date: QDate,
    readonly time: QTime,
  ) {}

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

  abstract isValid(): { valid: true } | { valid: false; issue: string };

  toJSON() {
    return this.toISO();
  }

  equals(other: T) {
    return this.asDecimal() == other.asDecimal();
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
}
export class QUtcDateTime extends QDateTime<QUtcDateTime> {
  isValid(): { valid: true } | { valid: false; issue: string } {
    const time = this.time.isValid();
    if (!time.valid) {
      return time;
    }
    const date = this.date.isValid();
    if (!date.valid) {
      return date;
    }
    return { valid: true };
  }

  toISO(): string {
    return `${this.date.toISO()}T${this.time.toISO()}Z`;
  }
  add(duration: InformalDuration): QUtcDateTime {
    const result = this.time.add(duration);
    return new QUtcDateTime(this.date.addDays(result.days), result.time);
  }

  diff(other: QUtcDateTime) {
    const dateDiff = this.date.diff(other.date);
    const timeDiff = this.time.diffSeconds(other.time);
    const diff = dateDiff * 24 * 60 * 60 + timeDiff;
    return new QDuration({ s: diff });
  }

  startOfMinute() {
    return new QUtcDateTime(this.date, this.time.startOfMinute());
  }

  isWithin(
    min: QUtcDateTime | null,
    max: QUtcDateTime | null,
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

  static rangesIntersect(
    minA: QUtcDateTime | null,
    maxA: QUtcDateTime | null,
    minB: QUtcDateTime | null,
    maxB: QUtcDateTime | null,
    { maxInclusive = false }: { maxInclusive?: boolean } = {},
  ): boolean {
    if (
      maxA != null &&
      minB != null &&
      (maxInclusive ? maxA.isBefore(minB) : maxA.isBeforeOrEqual(minB))
    ) {
      return false;
    }
    if (
      maxB != null &&
      minA != null &&
      (maxInclusive ? maxB.isBefore(minA) : maxB.isBeforeOrEqual(minA))
    ) {
      return false;
    }
    return true;
  }

  /** Parses "2023-09-23T20:30:55Z". Does not check for date/time validity. */
  static parse(input: string): QUtcDateTime | null {
    const components = input.split("T");
    if (components.length != 2) {
      return null;
    }
    if (!components[1].endsWith("Z")) {
      return null;
    }

    const date = QDate.parse(components[0]);
    const time = QTime.parse(components[1].slice(0, components[1].length - 1));
    if (date == null || time == null) {
      return null;
    }

    return new QUtcDateTime(date, time);
  }

  static readonly json = z.string().transform((x, ctx) => {
    const result = QUtcDateTime.parse(x);
    if (result == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a UTC datetime",
      });
      return z.NEVER;
    }
    return result;
  });
}
export class QLocalDateTime extends QDateTime<QLocalDateTime> {
  constructor(
    date: QDate,
    time: QTime,
    readonly offset: number,
  ) {
    super(date, time);
  }

  isValid(): { valid: true } | { valid: false; issue: string } {
    const time = this.time.isValid();
    if (!time.valid) {
      return time;
    }
    const date = this.date.isValid();
    if (!date.valid) {
      return date;
    }
    return { valid: true };
  }

  toISO(): string {
    const sign = this.offset >= 0 ? "+" : "-";
    const hrs = Math.floor(Math.abs(this.offset)).toFixed().padStart(2, "0");
    const mins = (Math.floor(Math.abs(this.offset) * 60) % 60)
      .toFixed()
      .padStart(2, "0");
    return `${this.date.toISO()}T${this.time.toISO()}${sign}${hrs}:${mins}`;
  }

  toUTC(): QUtcDateTime {
    const offsetTime = this.time.add({ h: -this.offset });
    return new QUtcDateTime(
      this.date.addDays(offsetTime.days),
      offsetTime.time,
    );
  }

  static parse(input: string): QLocalDateTime | null {
    const components = input
      .split("T")
      .map((x) => (x.includes(":") ? x.split(/[+-]/g) : x))
      .flat();
    if (components.length != 3) {
      return null;
    }

    const date = QDate.parse(components[0]);
    const time = QTime.parse(components[1]);
    const offset = QTime.parse(components[2]);
    const sign = input.split("T")[1].includes("-") ? -1 : 1;

    if (date == null || time == null || offset == null) {
      return null;
    }

    return new QLocalDateTime(
      date,
      time,
      (offset.hour + offset.minute / 60) * sign,
    );
  }

  static readonly json = z.string().transform((x, ctx) => {
    const result = QLocalDateTime.parse(x);
    if (result == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a local datetime",
      });
      return z.NEVER;
    }
    return result;
  });
}

export function toUTCDateTime(
  date: QDate,
  time: QTimetableTime,
  offset: number,
): QUtcDateTime {
  const dayOffset = Math.floor(time.hour / 24);
  const dateComponent = date.addDays(dayOffset);
  const timeComponent = new QTime(time.hour % 24, time.minute, time.second);
  return new QUtcDateTime(dateComponent, timeComponent).add({ h: -offset });
}
