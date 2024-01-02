import { z } from "zod";
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
  ) {}

  static readonly json = z.string().transform((x, ctx) => {
    const result = QWeekdayRange.parse(x);
    if (result == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a weekday range",
      });
      return z.NEVER;
    }
    return result;
  });

  asString() {
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

  toJSON(): z.input<typeof QWeekdayRange.json> {
    return this.asString();
  }

  static parse(input: string) {
    input = input.toUpperCase();
    if (input.length !== 7) {
      return null;
    }
    return new QWeekdayRange(
      input[0] === "M",
      input[1] === "T",
      input[2] === "W",
      input[3] === "T",
      input[4] === "F",
      input[5] === "S",
      input[6] === "S",
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
