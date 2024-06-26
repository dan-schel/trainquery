import { QCache } from "../../shared/qtime/qcache";
import { QDate } from "../../shared/qtime/qdate";
import { getOffsetLuxon } from "../../shared/qtime/luxon-conversions";
import { TimezoneConfig } from "../../shared/system/config/shared-config";

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
          return getOffsetLuxon(d, config.id, config.offsetCheckHour);
        },
        (d) => d.toISO(),
        100,
      );
    }
  }

  get(date: QDate): number {
    return this._calculator.get(date);
  }
}
