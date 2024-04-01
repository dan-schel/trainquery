import { SerializedDisruption } from "../../../shared/disruptions/serialized-disruption";
import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../../shared/system/ids";
import { CompletePattern } from "../../../shared/system/service/complete-pattern";
import { Service } from "../../../shared/system/service/service";
import { TrainQuery } from "../../ctx/trainquery";
import { PtvRawDisruption } from "../source/ptv/ptv-raw-disruption";
import { PtvRawDisruptionData } from "../source/ptv/ptv-raw-disruption-data";

export class PtvGeneralDisruption extends PtvRawDisruption<"ptv-general"> {
  constructor(
    ptvData: PtvRawDisruptionData,
    readonly lines: LineID[],
    readonly stops: StopID[],
  ) {
    super(ptvData);
  }

  affectsService(_ctx: TrainQuery, service: Service): boolean {
    if (!this.lines.includes(service.line)) {
      return false;
    }

    // We can only really check origin and termination times if we have the
    // complete pattern.
    if (service.pattern instanceof CompletePattern) {
      const origin = service.pattern.origin.scheduledTime;
      const terminus = service.pattern.terminus.scheduledTime;
      return QUtcDateTime.rangesIntersect(
        origin,
        terminus,
        this.ptvData.starts,
        this.ptvData.ends,
      );
    }

    // Otherwise we'll be cautious and display it for all services on the
    // affected lines, I guess.
    return true;
  }

  affectsStop(ctx: TrainQuery, stop: StopID, time: QUtcDateTime): boolean {
    return this.stops.includes(stop) && this.occursAt(ctx, time);
  }

  affectsLine(ctx: TrainQuery, line: LineID, time: QUtcDateTime): boolean {
    return this.lines.includes(line) && this.occursAt(ctx, time);
  }

  affectsDate(_ctx: TrainQuery, _date: QDate): boolean {
    return false;
  }

  occursAt(_ctx: TrainQuery, time: QUtcDateTime): boolean {
    return time.isWithin(this.ptvData.starts, this.ptvData.ends);
  }

  toJSON(_ctx: TrainQuery): SerializedDisruption<"ptv-general"> {
    return {
      type: "ptv-general",
      message: this.ptvData.title,
      url: this.ptvData.url,
    };
  }
}
