import { SerializedDisruption } from "../../../shared/disruptions/serialized-disruption";
import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../../shared/system/ids";
import { Service } from "../../../shared/system/service/service";
import { TrainQuery } from "../../trainquery";
import { Disruption } from "../disruption";

export class PtvStopDisruption extends Disruption<"ptv-stop"> {
  constructor(
    readonly stops: StopID[],
    readonly message: string,
    readonly url: string | null,
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {
    super();
  }

  affectsService(_ctx: TrainQuery, _service: Service): boolean {
    return false;
  }

  affectsStop(_ctx: TrainQuery, stop: StopID, time: QUtcDateTime): boolean {
    return this.stops.includes(stop) && time.isWithin(this.starts, this.ends);
  }

  affectsLine(_ctx: TrainQuery, _line: LineID, _time: QUtcDateTime): boolean {
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
