import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { QTime } from "../../shared/qtime/qtime";
import {
  toDirectionID,
  toLineID,
  toRouteVariantID,
  toStaticServiceID,
  toStopID,
} from "../../shared/system/ids";
import { Departure } from "../../shared/system/timetable/service";
import { ServerParams, TrainQuery, requireStopParam } from "../trainquery";

export async function departuresApi(
  ctx: TrainQuery,
  params: ServerParams
): Promise<object> {
  const stop = requireStopParam(ctx, params, "stop");

  const departures: Departure[] = [
    new Departure(
      new QUtcDateTime(new QDate(2023, 9, 7), new QTime(9, 14, 0)),
      null,
      null,
      true,
      true,
      toStopID(104),
      [toLineID(4)],
      toRouteVariantID("direct"),
      toDirectionID("up"),
      null,
      null,
      toStaticServiceID("catdog"),
      []
    ),
  ];

  return [
    // departures.map(d => d.toJSON()),
    // departures.map(d => d.toJSON()),
    // departures.map(d => d.toJSON()),
    // departures.map(d => d.toJSON())
  ];
}
