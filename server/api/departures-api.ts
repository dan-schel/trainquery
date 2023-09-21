import { BadApiCallError, requireParam } from "../param-utils";
import { ServerParams, TrainQuery } from "../trainquery";
import { DepartureFeed } from "../../shared/system/timetable/departure-feed";
import { getDepartures } from "../timetable/get-departures";
import { FilteredBucket } from "../timetable/filtering";
import { specificize } from "../timetable/specificize";
import { unique } from "@schel-d/js-utils";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { QDate } from "../../shared/qtime/qdate";
import { QTime } from "../../shared/qtime/qtime";

export async function departuresApi(
  ctx: TrainQuery,
  params: ServerParams
): Promise<object> {
  const feedsString = requireParam(params, "feeds");
  const feeds = DepartureFeed.decode(feedsString);
  if (feeds == null) {
    throw new BadApiCallError(`Provided feeds string is invalid.`);
  }

  const buckets = feeds.map(f => new FilteredBucket(f.stop, f.count, f.filter));
  const uniqueStops = unique(feeds.map(f => f.stop), (a, b) => a == b);

  // TODO: The time should be a param!
  // Value: Thursday 7:30am AEST
  const time = new QUtcDateTime(new QDate(2023, 9, 20), new QTime(21, 30, 0));

  uniqueStops.forEach(s => {
    getDepartures(ctx, s, time, buckets.filter(b => b.stop == s), specificize);
  });

  return buckets.map(b => b.departures.map(d => d.toJSON()));
}
