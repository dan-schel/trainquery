import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { QTime } from "../../shared/qtime/qtime";
import {
  toDirectionID,
  toLineID,
  toPlatformID,
  toStaticServiceID,
} from "../../shared/system/ids";
import { HookRoute } from "../../shared/system/routes/hook-route";
import { Departure } from "../../shared/system/timetable/departure";
import { ServiceStop } from "../../shared/system/timetable/service-stop";
import { ServerParams, TrainQuery, requireStopParam } from "../trainquery";

export async function departuresApi(
  ctx: TrainQuery,
  params: ServerParams
): Promise<object> {
  const stop = requireStopParam(ctx, params, "stop");

  const departures: Departure[] = [
    new Departure(
      toLineID(5),
      [],
      HookRoute.directID,
      toDirectionID("up"),
      { terminusIndex: 8 },
      toStaticServiceID("18"),
      [],
      null,
      new ServiceStop(
        new QUtcDateTime(new QDate(2023, 9, 8), new QTime(5, 4, 0)),
        null,
        true,
        true,
        {
          id: toPlatformID("1"),
          confidence: "high"
        }
      )
    )
  ];

  return [
    // departures.map(d => d.toJSON()),
    // departures.map(d => d.toJSON()),
    // departures.map(d => d.toJSON()),
    // departures.map(d => d.toJSON())
  ];
}
