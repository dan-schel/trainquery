import { DisruptionData } from "../../../shared/disruptions/processed/disruption-data";
import { QDate } from "../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../../shared/system/ids";
import { Service } from "../../../shared/system/service/service";
import { TrainQuery } from "../../ctx/trainquery";

export abstract class DisruptionTypeHandler<
  DisruptionType extends DisruptionData,
> {
  constructor(readonly ctx: TrainQuery) {}

  abstract affectsService(
    disruption: DisruptionType,
    service: Service,
  ): boolean;

  abstract affectsStop(
    disruption: DisruptionType,
    stop: StopID,
    time: QUtcDateTime,
  ): boolean;

  abstract affectsLine(
    disruption: DisruptionType,
    line: LineID,
    time: QUtcDateTime,
  ): boolean;

  abstract affectsDate(disruption: DisruptionType, date: QDate): boolean;
}
