import { repeat } from "@schel-d/js-utils";
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
import { PartialStoppingPattern } from "../../shared/system/timetable/stopping-pattern";
import { BadApiCallError, requireParam } from "../param-utils";
import { ServerParams, TrainQuery } from "../trainquery";
import { DepartureFeed } from "../../shared/system/timetable/departure-feed";

export async function departuresApi(
  _ctx: TrainQuery,
  params: ServerParams
): Promise<object> {
  const feedsString = requireParam(params, "feeds");
  const feeds = DepartureFeed.decode(feedsString);
  if (feeds == null) {
    throw new BadApiCallError(`Provided feeds string is invalid.`);
  }

  const departure = new Departure(
    toLineID(5),
    [],
    HookRoute.directID,
    toDirectionID("up"),
    new PartialStoppingPattern(0, 8),
    toStaticServiceID("18"),
    [],
    null,
    2,
    new ServiceStop(
      new QUtcDateTime(new QDate(2023, 9, 8), new QTime(5, 4, 0)),
      null,
      true,
      true,
      {
        id: toPlatformID("1"),
        confidence: "high",
      }
    )
  );

  return feeds.map((f) => repeat(departure, f.count));
}
