import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { LineID, StopID } from "../../shared/system/ids";
import { Service } from "../../shared/system/service/service";
import { TrainQuery } from "../trainquery";

export type SerializedDisruption<Type extends string> = {
  type: Type;
  message: string;
  url: string | null;
  [others: string]: any;
};

export abstract class Disruption<Type extends string = string> {
  abstract affectsService(ctx: TrainQuery, service: Service): boolean;

  abstract affectsStop(
    ctx: TrainQuery,
    stop: StopID,
    timeUTC: QUtcDateTime,
  ): boolean;

  abstract affectsLine(
    ctx: TrainQuery,
    line: LineID,
    timeUTC: QUtcDateTime,
  ): boolean;

  abstract affectsDate(ctx: TrainQuery, date: QDate): boolean;

  abstract toJSON(ctx: TrainQuery): SerializedDisruption<Type>;
}
