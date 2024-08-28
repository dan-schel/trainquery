import { z } from "zod";
import { api } from "./api-definition";
import { DepartureWithDisruptions } from "../disruptions/departure-with-disruptions";
import { DepartureFeed } from "../system/timetable/departure-feed";
import { QUtcDateTime } from "../qtime/qdatetime";

export const departuresApi = api({
  endpoint: "departures",
  requiredRole: null,
  checkConfigHash: true,

  paramsSchema: z.object({
    feeds: DepartureFeed.json.array(),
    time: QUtcDateTime.json,
  }),
  resultSchema: DepartureWithDisruptions.json.array().array(),

  paramsSerializer: (params) => ({
    feeds: params.feeds.map((x) => x.toJSON()),
    time: params.time.toJSON(),
  }),
  resultSerializer: (result) =>
    result.map((feed) => feed.map((x) => x.toJSON())),
});
