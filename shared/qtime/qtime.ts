import { parseIntThrow, posMod } from "@schel-d/js-utils";

export abstract class QTimeBase<T extends QTimeBase<T>> {
  constructor(
    readonly hour: number,
    readonly minute: number,
    readonly second: number
  ) { }

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
    return this.hour * 1000 + this.minute * 100 + this.second;
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

  /**
   * Add `h` hours, `m` minutes, and `s` seconds to this time. `h`/`m`/`s` can
   * be negative.
   */
  add({ h, m, s }: { h?: number; m?: number; s?: number }): {
    time: QTime;
    days: number;
  } {
    let days = 0;
    let hour = this.hour + (h ?? 0);
    let minute = this.minute + (m ?? 0);
    let second = this.second + (s ?? 0);
    while (second > 59) {
      second -= 60;
      minute++;
    }
    while (second < 0) {
      second += 60;
      minute--;
    }
    while (minute > 59) {
      minute -= 60;
      hour++;
    }
    while (minute < 0) {
      minute += 60;
      hour--;
    }
    while (hour > 23) {
      hour -= 24;
      days++;
    }
    while (hour < 0) {
      hour += 24;
      days--;
    }
    return { time: new QTime(hour, minute, second), days: days };
  }

  /** Accepts "09:45", "14:55:32", etc. */
  static parse(input: string): QTime | null {
    if (!/^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$/.test(input)) {
      return null;
    }
    const numbers = input.split(":").map((x) => parseIntThrow(x));
    return new QTime(numbers[0], numbers[1], numbers[2] ?? 0);
  }

  toJSON() {
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

  /**
   * Add `h` hours, `m` minutes, and `s` seconds to this time. `h`/`m`/`s` can
   * be negative.
   */
  add({
    h,
    m,
    s,
  }: {
    h?: number;
    m?: number;
    s?: number;
  }): QTimetableTime | null {
    let hour = this.hour + (h ?? 0);
    let minute = this.minute + (m ?? 0);
    let second = this.second + (s ?? 0);
    while (second > 59) {
      second -= 60;
      minute++;
    }
    while (second < 0) {
      second += 60;
      minute--;
    }
    while (minute > 59) {
      minute -= 60;
      hour++;
    }
    while (minute < 0) {
      minute += 60;
      hour--;
    }

    if (hour < 0 || hour > 47) {
      return null;
    }
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
      time.second
    );
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

  toJSON() {
    return this.toTtblString(this.second != 0);
  }
}
