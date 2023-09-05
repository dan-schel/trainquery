import { parseIntThrow } from "@schel-d/js-utils";

const _daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const _monthAcronyms = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function isLeapYear(year: number): boolean {
  return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}

function getDaysInMonth(year: number, month: number): number {
  if (month == 2 && isLeapYear(year)) {
    return 29;
  }
  return _daysInMonth[month - 1];
}

function getMonthAcronym(month: number) {
  return _monthAcronyms[month - 1];
}

export class QDate {
  constructor(
    readonly year: number,
    readonly month: number,
    readonly day: number
  ) { }
  isValid(): { valid: true } | { valid: false; issue: string } {
    const invalid = (issue: string) => ({ valid: false, issue: issue });

    if (!Number.isInteger(this.year) || this.year < 0) {
      return invalid(`"${this.year}" is not a valid year.`);
    }
    if (!Number.isInteger(this.month) || this.month < 1 || this.month > 12) {
      return invalid(`"${this.month}" is not a valid month.`);
    }
    if (!Number.isInteger(this.day) || this.day < 1) {
      return invalid(`"${this.day}" is not a valid day.`);
    }

    const daysInMonth = getDaysInMonth(this.year, this.month);
    if (this.day > daysInMonth) {
      return invalid(
        `${getMonthAcronym(this.month)} ${this.year
        } only has ${daysInMonth} days.`
      );
    }

    return { valid: true };
  }
  /** E.g. 20230815 for 15th Aug 2023. */
  asDecimal(): number {
    return this.year * 1000 + this.month * 100 + this.day;
  }
  /** E.g. "2023-08-15" for 15th Aug 2023. */
  toISO() {
    const y = this.year.toFixed().padStart(4, "0");
    const m = this.month.toFixed().padStart(2, "0");
    const d = this.day.toFixed().padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /** Parses "2023-09-04" to a QDate. Does not check for date validity. */
  static parse(input: string): QDate | null {
    if (!/^[0-9]{4}-?[0-9]{2}-?[0-9]{2}$/.test(input)) {
      return null;
    }
    input = input.replace(/-/g, "");
    const year = parseIntThrow(input.slice(0, 4));
    const month = parseIntThrow(input.slice(4, 6));
    const day = parseIntThrow(input.slice(6, 8));
    return new QDate(year, month, day);
  }

  /** Returns the date when `x` days have passed. `x` can be negative. */
  addDays(x: number): QDate {
    let day = this.day + x;
    let month = this.month;
    let year = this.year;
    while (day > getDaysInMonth(year, month)) {
      day -= getDaysInMonth(year, month);
      month++;
      if (month > 12) {
        month = 0;
        year++;
      }
    }
    while (day < 1) {
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      day += getDaysInMonth(year, month);
    }
    return new QDate(year, month, day);
  }
  tomorrow() {
    return this.addDays(1);
  }
  yesterday() {
    return this.addDays(-1);
  }
  equals(other: QDate) {
    return this.asDecimal() == other.asDecimal();
  }
  isBefore(other: QDate) {
    return this.asDecimal() < other.asDecimal();
  }
  isBeforeOrEqual(other: QDate) {
    return this.asDecimal() <= other.asDecimal();
  }
  isAfter(other: QDate) {
    return this.asDecimal() > other.asDecimal();
  }
  isAfterOrEqual(other: QDate) {
    return this.asDecimal() >= other.asDecimal();
  }
}
