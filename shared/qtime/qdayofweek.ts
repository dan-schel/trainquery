import { posMod } from "@schel-d/js-utils";
import { QCache } from "./qcache";
import { QDate } from "./qdate";

const _acronyms = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const _names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const _cache = new QCache<QDate, QDayOfWeek>(
  (d) =>
    new QDayOfWeek(
      posMod(new Date(d.year, d.month - 1, d.day).getDay() - 1, 7)
    ),
  (d) => d.toISO(),
  100
);

export class QDayOfWeek {
  static mon = new QDayOfWeek(0);
  static tue = new QDayOfWeek(1);
  static wed = new QDayOfWeek(2);
  static thu = new QDayOfWeek(3);
  static fri = new QDayOfWeek(4);
  static sat = new QDayOfWeek(5);
  static sun = new QDayOfWeek(6);

  constructor(readonly index: number) { }

  isValid(): { valid: true } | { valid: false; issue: string } {
    if (!Number.isInteger(this.index) || this.index < 0 || this.index > 6) {
      return {
        valid: false,
        issue: `${this.index} is not a valid day-of-week index.`,
      };
    }
    return { valid: true };
  }

  static fromDate(date: QDate): QDayOfWeek {
    return _cache.get(date);
  }

  toAcronym(): string {
    return _acronyms[this.index];
  }
  toName(): string {
    return _names[this.index];
  }
  addDays(days: number): QDayOfWeek {
    if (!Number.isInteger(days)) {
      throw new Error(`Cannot add "${days}" days to a day of the week.`);
    }
    return new QDayOfWeek(posMod(this.index + days, 7));
  }
  tomorrow() {
    return this.addDays(1);
  }
  yesterday() {
    return this.addDays(-1);
  }
  equals(other: QDayOfWeek): boolean {
    return other.index == this.index;
  }
}
