import { QCache } from "../../shared/qtime/qcache";
import { QDate } from "../../shared/qtime/qdate";
import { TimezoneConfig } from "../../shared/system/config-elements";
import { getOffset } from "../../shared/qtime/luxon-conversions";

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
          return getOffset(d, config.id, config.offsetCheckHour);
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
