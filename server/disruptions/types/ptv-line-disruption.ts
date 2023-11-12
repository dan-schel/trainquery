import { SerializedDisruption } from "../../../shared/disruptions/serialized-disruption";
import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../../shared/system/ids";
import { CompletePattern } from "../../../shared/system/service/complete-pattern";
import { Service } from "../../../shared/system/service/service";
import { TrainQuery } from "../../trainquery";
import { Disruption } from "../disruption";

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
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {
    super();
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
        this.starts,
        this.ends,
      );
    }

    // Otherwise we'll be cautious and display it for all services on the
    // affected lines, I guess.
    return true;
  }

  affectsStop(_ctx: TrainQuery, _stop: StopID, _time: QUtcDateTime): boolean {
    return false;
  }

  affectsLine(_ctx: TrainQuery, line: LineID, time: QUtcDateTime): boolean {
    return this.lines.includes(line) && time.isWithin(this.starts, this.ends);
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
