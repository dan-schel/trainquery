import { z } from "zod";
import { api, params, result } from "./api-definition";
import { DepartureWithDisruptions } from "../disruptions/departure-with-disruptions";
import { DepartureFeed } from "../system/timetable/departure-feed";
import { QUtcDateTime } from "../qtime/qdatetime";

export const departuresApi = api({
  endpoint: "departures",
  requiredRole: null,
  checkConfigHash: true,

  ...params(
    z.object({
      feeds: DepartureFeed.json.array(),
      time: QUtcDateTime.json,
    }),
    (params) => ({
      feeds: params.feeds.map((x) => x.toJSON()),
      time: params.time.toJSON(),
    }),
  ),

  ...result(DepartureWithDisruptions.json.array().array(), (result) =>
    result.map((feed) => feed.map((x) => x.toJSON())),
  ),
});
