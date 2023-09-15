import { QCache } from "../../shared/qtime/qcache";
import { QDate } from "../../shared/qtime/qdate";
import { DateTime } from "luxon";
import { TimezoneConfig } from "../../shared/system/config-elements";

export class OffsetCalculator {
  private _calculator: { get(key: QDate): number };

  constructor(config: TimezoneConfig) {
    if ("offset" in config) {
      this._calculator = {
        get: () => config.offset,
      };
    } else {
      this._calculator = new QCache<QDate, number>(
        (d) => {
          const localTime = DateTime.local(
            d.year,
            d.month,
            d.day,
            config.offsetCheckHour,
            0,
            0,
            { zone: config.id }
          );
          const utcTime = localTime.toUTC();
          const offsetUtc = localTime.setZone("utc", { keepLocalTime: true });
          return offsetUtc.diff(utcTime).as("hours");
        },
        (d) => d.toISO(),
        100
      );
    }
  }

  get(date: QDate): number {
    return this._calculator.get(date);
  }
}
