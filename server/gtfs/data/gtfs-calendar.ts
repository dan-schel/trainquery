import { z } from "zod";
import { QDate } from "../../../shared/qtime/qdate";
import { QDayOfWeek } from "../../../shared/qtime/qdayofweek";
import { QWeekdayRange } from "../../../shared/qtime/qweekdayrange";

export class GtfsCalendar {
  constructor(
    readonly gtfsCalendarID: string,
    readonly gtfsSubfeedID: string | null,
    readonly wdr: QWeekdayRange,
    readonly start: QDate,
    readonly end: QDate,
    readonly additionalDates: QDate[],
    readonly exceptions: QDate[],
  ) {}

  static readonly json = z
    .object({
      gtfsCalendarID: z.string(),
      gtfsSubfeedID: z.string().nullable(),
      wdr: QWeekdayRange.json,
      start: QDate.json,
      end: QDate.json,
      additionalDates: QDate.json.array(),
      exceptions: QDate.json.array(),
    })
    .transform(
      (x) =>
        new GtfsCalendar(
          x.gtfsCalendarID,
          x.gtfsSubfeedID,
          x.wdr,
          x.start,
          x.end,
          x.additionalDates,
          x.exceptions,
        ),
    );

  withSubfeedID(subfeedID: string): GtfsCalendar {
    return new GtfsCalendar(
      this.gtfsCalendarID,
      subfeedID,
      this.wdr,
      this.start,
      this.end,
      this.additionalDates,
      this.exceptions,
    );
  }

  toJSON(): z.input<typeof GtfsCalendar.json> {
    return {
      gtfsCalendarID: this.gtfsCalendarID,
      gtfsSubfeedID: this.gtfsSubfeedID,
      wdr: this.wdr.toJSON(),
      start: this.start.toJSON(),
      end: this.end.toJSON(),
      additionalDates: this.additionalDates.map((d) => d.toJSON()),
      exceptions: this.exceptions.map((d) => d.toJSON()),
    };
  }

  appliesOn(date: QDate) {
    if (this.exceptions.find((d) => d.equals(date))) {
      return false;
    }
    if (this.additionalDates.find((d) => d.equals(date))) {
      return true;
    }

    const dowIncluded = this.wdr.includes(QDayOfWeek.fromDate(date));
    const withinDates = date.isWithin(this.start, this.end, {
      maxInclusive: true,
    });
    return withinDates && dowIncluded;
  }
}
