import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../../shared/system/ids";
import { Service } from "../../../shared/system/service/service";
import { TrainQuery } from "../../trainquery";
import { Disruption, SerializedDisruption } from "../disruption";

export class PtvStopDisruption extends Disruption<"ptv-stop"> {
  constructor(
    readonly stops: StopID[],
    readonly message: string,
    readonly url: string | null,
  ) {
    super();
  }

  affectsService(_ctx: TrainQuery, _service: Service): boolean {
    return false;
  }

  affectsStop(_ctx: TrainQuery, stop: StopID, _timeUTC: QUtcDateTime): boolean {
    return this.stops.includes(stop);
  }

  affectsLine(
    _ctx: TrainQuery,
    _line: LineID,
    _timeUTC: QUtcDateTime,
  ): boolean {
    return false;
  }

  affectsDate(_ctx: TrainQuery, _date: QDate): boolean {
    return false;
  }

  toJSON(_ctx: TrainQuery): SerializedDisruption<"ptv-stop"> {
    return {
      type: "ptv-stop",
      message: this.message,
      url: this.url,
    };
  }
}
