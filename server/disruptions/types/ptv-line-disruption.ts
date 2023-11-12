import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../../shared/system/ids";
import { Service } from "../../../shared/system/service/service";
import { TrainQuery } from "../../trainquery";
import { Disruption, SerializedDisruption } from "../disruption";

export type PtvLineDisruptionCategory =
  | "buses"
  | "no-city-loop"
  | "service-changes"
  | "unknown";

export class PtvLineDisruption extends Disruption<"ptv-line"> {
  constructor(
    readonly lines: LineID[],
    readonly category: PtvLineDisruptionCategory,
    readonly message: string,
    readonly url: string | null,
  ) {
    super();
  }

  affectsService(_ctx: TrainQuery, _service: Service): boolean {
    return false;
  }

  affectsStop(
    _ctx: TrainQuery,
    _stop: StopID,
    _timeUTC: QUtcDateTime,
  ): boolean {
    return false;
  }

  affectsLine(_ctx: TrainQuery, line: LineID, _timeUTC: QUtcDateTime): boolean {
    return this.lines.includes(line);
  }

  affectsDate(_ctx: TrainQuery, _date: QDate): boolean {
    return false;
  }

  toJSON(_ctx: TrainQuery): SerializedDisruption<"ptv-line"> {
    return {
      type: "ptv-line",
      message: this.message,
      url: this.url,
      category: this.category,
    };
  }
}
