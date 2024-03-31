import { SerializedDisruption } from "../../../shared/disruptions/serialized-disruption";
import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../../shared/system/ids";
import { CompletePattern } from "../../../shared/system/service/complete-pattern";
import { Service } from "../../../shared/system/service/service";
import { TrainQuery } from "../../ctx/trainquery";
import { RawDisruption } from "../disruption";

export type PtvRawDisruptionCategory =
  | "buses"
  | "no-city-loop"
  | "service-changes"
  | "alternate-timetable"
  | "line-closure"
  | "minor-delays"
  | "major-delays"
  | "services-cancelled"
  | "services-terminating-early"
  | "services-originating-late"
  | "lift-outage"
  | "escalator-outage"
  | "car-park-closure"
  | "pedestrian-access-changes"
  | "multiple-stop-amenity-issues"
  | "stop-closed"
  | "unknown";

export class PtvRawDisruption extends RawDisruption<"ptv-raw"> {
  constructor(
    readonly lines: LineID[],
    readonly stops: StopID[],
    readonly category: PtvRawDisruptionCategory,
    readonly message: string,
    readonly summaryMessage: string | null,
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
    return time.isWithin(this.starts, this.ends);
  }

  toJSON(_ctx: TrainQuery): SerializedDisruption<"ptv-raw"> {
    return {
      type: "ptv-raw",
      message: this.message,
      url: this.url,
      category: this.category,
      summaryMessage: this.summaryMessage ?? messageFromCategory(this.category),
    };
  }
}

function messageFromCategory(
  category: PtvRawDisruptionCategory,
): string | null {
  if (category === "buses") {
    return "Buses may replace trains";
  } else if (category === "no-city-loop") {
    return "Trains not running via the loop";
  } else if (category === "service-changes") {
    return "Service changes apply";
  } else if (category === "alternate-timetable") {
    return "Alternate timetable in effect";
  } else if (category === "line-closure") {
    return "Trains suspended";
  } else if (category === "minor-delays") {
    return "Minor delays";
  } else if (category === "major-delays") {
    return "Major delays";
  } else if (category === "services-cancelled") {
    return "Some trains cancelled";
  } else if (category === "services-terminating-early") {
    return "Some trains terminating early";
  } else if (category === "services-originating-late") {
    return "Some trains originating late";
  } else if (category === "lift-outage") {
    return "Lift outage";
  } else if (category === "escalator-outage") {
    return "Escalator outage";
  } else if (category === "car-park-closure") {
    return "Car park closure";
  } else if (category === "pedestrian-access-changes") {
    return "Pedestrian access changes";
  } else if (category === "multiple-stop-amenity-issues") {
    return "Multiple issues";
  } else if (category === "stop-closed") {
    return "Station closed";
  } else {
    return null;
  }
}
