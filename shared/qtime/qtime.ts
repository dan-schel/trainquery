export class QTime {
  constructor(
    readonly hour: number,
    readonly minute: number,
    readonly second: number
  ) {
    this.hour = hour;
    this.minute = minute;
    this.second = second;
  }
  isValid(): { valid: true } | { valid: false, issue: string } {
    const invalid = (issue: string) => ({ valid: false, issue: issue });

    if (!Number.isInteger(this.hour) || this.hour < 0 || this.hour > 23) {
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
  /** E.g. "14:59:00" for 2:59pm. */
  toISO() {
    const h = this.hour.toFixed().padStart(2, "0");
    const m = this.minute.toFixed().padStart(2, "0");
    const s = this.second.toFixed().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }
  /** Add `h` hours, `m` minutes, and `s` seconds to this time. `h`/`m`/`s` can be negative. */
  add({ h, m, s }: { h?: number, m?: number, s?: number }): { time: QTime, days: number } {
    let days = 0;
    let hour = this.hour + (h ?? 0);
    let minute = this.minute + (m ?? 0);
    let second = this.second + (s ?? 0);
    while (second > 59) { second -= 60; minute++; }
    while (second < 0) { second += 60; minute--; }
    while (minute > 59) { minute -= 60; hour++; }
    while (minute < 0) { minute += 60; hour--; }
    while (hour > 23) { hour -= 24; days++; }
    while (hour < 0) { hour += 24; days--; }
    return { time: new QTime(hour, minute, second), days: days };
  }
  equals(other: QTime) { return this.asDecimal() == other.asDecimal(); }
  isBefore(other: QTime) { return this.asDecimal() < other.asDecimal(); }
  isBeforeOrEqual(other: QTime) { return this.asDecimal() <= other.asDecimal(); }
  isAfter(other: QTime) { return this.asDecimal() > other.asDecimal(); }
  isAfterOrEqual(other: QTime) { return this.asDecimal() >= other.asDecimal(); }
}
