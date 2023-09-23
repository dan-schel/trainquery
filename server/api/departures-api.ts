import {
  BadApiCallError,
  requireDateTimeParam,
  requireParam,
} from "../param-utils";
import { ServerParams, TrainQuery } from "../trainquery";
import { DepartureFeed } from "../../shared/system/timetable/departure-feed";
import { getDepartures } from "../timetable/get-departures";
import { FilteredBucket } from "../timetable/filtering";
import { specificize } from "../timetable/specificize";
import { unique } from "@schel-d/js-utils";

export async function departuresApi(
  ctx: TrainQuery,
  params: ServerParams
): Promise<object> {
  const feedsString = requireParam(params, "feeds");
  const feeds = DepartureFeed.decode(feedsString);
  if (feeds == null) {
    throw new BadApiCallError(`Provided feeds string is invalid.`);
  }

  const time = requireDateTimeParam(params, "time");

  const buckets = feeds.map(
    (f) => new FilteredBucket(f.stop, f.count, f.filter)
  );
  const uniqueStops = unique(
    feeds.map((f) => f.stop),
    (a, b) => a == b
  );

  uniqueStops.forEach((s) => {
    getDepartures(
      ctx,
      s,
      time,
      buckets.filter((b) => b.stop == s),
      specificize
    );
  });

  return buckets.map((b) => b.departures.map((d) => d.toJSON()));
}
