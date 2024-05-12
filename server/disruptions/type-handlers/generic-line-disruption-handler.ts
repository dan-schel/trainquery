import { DisruptionTypeHandler } from "./disruption-type-handler";
import { GenericLineDisruption } from "../../../shared/disruptions/types/generic-line-disruption";
import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { StopID, LineID } from "../../../shared/system/ids";
import { CompletePattern } from "../../../shared/system/service/complete-pattern";
import { Service } from "../../../shared/system/service/service";

export class GenericLineDisruptionHandler extends DisruptionTypeHandler<GenericLineDisruption> {
  affectsService(disruption: GenericLineDisruption, service: Service): boolean {
    if (!disruption.affectedLines.includes(service.line)) {
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
        disruption.starts,
        disruption.ends,
      );
    }

    // Otherwise we'll be cautious and display it for all services on the
    // affected lines, I guess.
    return true;
  }

  affectsStop(
    _disruption: GenericLineDisruption,
    _stop: StopID,
    _time: QUtcDateTime,
  ): boolean {
    return false;
  }

  affectsLine(
    disruption: GenericLineDisruption,
    line: LineID,
    time: QUtcDateTime,
  ): boolean {
    return (
      disruption.affectedLines.includes(line) &&
      time.isWithin(disruption.starts, disruption.ends)
    );
  }

  affectsDate(_disruption: GenericLineDisruption, _date: QDate): boolean {
    return false;
  }
}
