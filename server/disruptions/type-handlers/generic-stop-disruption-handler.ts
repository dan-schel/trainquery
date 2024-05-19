import { DisruptionTypeHandler } from "./disruption-type-handler";
import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { StopID, LineID } from "../../../shared/system/ids";
import { Service } from "../../../shared/system/service/service";
import { GenericStopDisruptionData } from "../../../shared/disruptions/processed/types/generic-stop";

export class GenericStopDisruptionHandler extends DisruptionTypeHandler<GenericStopDisruptionData> {
  affectsService(
    _disruption: GenericStopDisruptionData,
    _service: Service,
  ): boolean {
    return false;
  }

  affectsStop(
    disruption: GenericStopDisruptionData,
    stop: StopID,
    time: QUtcDateTime,
  ): boolean {
    return (
      disruption.affectedStops.includes(stop) &&
      time.isWithin(disruption.starts, disruption.ends)
    );
  }

  affectsLine(
    _disruption: GenericStopDisruptionData,
    _line: LineID,
    _time: QUtcDateTime,
  ): boolean {
    return false;
  }

  affectsDate(_disruption: GenericStopDisruptionData, _date: QDate): boolean {
    return false;
  }
}
