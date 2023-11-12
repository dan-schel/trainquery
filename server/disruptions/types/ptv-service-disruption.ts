import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../../shared/system/ids";
import { Service } from "../../../shared/system/service/service";
import { TrainQuery } from "../../trainquery";
import { Disruption, SerializedDisruption } from "../disruption";

export type PtvServiceDisruptionCategory = "cancelled" | "unknown";

export class PtvServiceDisruption extends Disruption<"ptv-service"> {
  constructor(
    // TODO: Features to identify the service.
    readonly category: PtvServiceDisruptionCategory,
    readonly message: string,
    readonly url: string | null,
  ) {
    super();
  }

  affectsService(_ctx: TrainQuery, _service: Service): boolean {
    // TODO: Use said features to now, y'know, identify the service!
    return false;
  }

  affectsStop(_ctx: TrainQuery, _stop: StopID, _time: QUtcDateTime): boolean {
    return false;
  }

  affectsLine(_ctx: TrainQuery, _line: LineID, _time: QUtcDateTime): boolean {
    return false;
  }

  affectsDate(_ctx: TrainQuery, _date: QDate): boolean {
    return false;
  }

  toJSON(_ctx: TrainQuery): SerializedDisruption<"ptv-service"> {
    return {
      type: "ptv-service",
      message: this.message,
      url: this.url,
      category: this.category,
    };
  }
}
