import { DisruptionTypeHandler } from "./disruption-type-handler";
import { GenericStopDisruption } from "../../../shared/disruptions-v2/types/generic-stop-disruption";
import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { StopID, LineID } from "../../../shared/system/ids";
import { Service } from "../../../shared/system/service/service";

export class GenericStopDisruptionHandler extends DisruptionTypeHandler<GenericStopDisruption> {
  affectsService(
    _disruption: GenericStopDisruption,
    _service: Service,
  ): boolean {
    return false;
  }

  affectsStop(
    disruption: GenericStopDisruption,
    stop: StopID,
    time: QUtcDateTime,
  ): boolean {
    return (
      disruption.affectedStops.includes(stop) &&
      time.isWithin(disruption.starts, disruption.ends)
    );
  }

  affectsLine(
    _disruption: GenericStopDisruption,
    _line: LineID,
    _time: QUtcDateTime,
  ): boolean {
    return false;
  }

  affectsDate(_disruption: GenericStopDisruption, _date: QDate): boolean {
    return false;
  }
}
