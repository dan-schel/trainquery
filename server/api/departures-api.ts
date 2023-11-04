import {
  BadApiCallError,
  requireDateTimeParam,
  requireParam,
} from "../param-utils";
import { ServerParams, TrainQuery } from "../trainquery";
import { DepartureFeed } from "../../shared/system/timetable/departure-feed";
import { getDepartures } from "../timetable/get-departures";
import { PassthroughBucket } from "../timetable/filtering";
import { specificizeGtfsDeparture } from "../timetable/specificize";
import { unique } from "@schel-d/js-utils";
import {
  GtfsDepartureSource,
  GtfsPossibility,
} from "../departures/gtfs-departure-source";
import { Departure } from "../../shared/system/service/departure";

const maxFeeds = 10;
const maxCount = 20;

export async function departuresApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  const feedsString = requireParam(params, "feeds");
  const feeds = DepartureFeed.decode(feedsString);
  if (feeds == null) {
    throw new BadApiCallError(`Provided feeds string is invalid.`);
  }
  if (feeds.length > maxFeeds || feeds.some((f) => f.count > maxCount)) {
    throw new BadApiCallError(
      `Too many feeds or too many departures per feed.`,
    );
  }

  const time = requireDateTimeParam(params, "time");

  const buckets = feeds.map(
    // (f) => new FilteredBucket<Departure>(ctx, f.stop, f.count, f.filter),
    (f) => new PassthroughBucket<Departure>(f.stop, f.count),
  );
  const uniqueStops = unique(
    feeds.map((f) => f.stop),
    (a, b) => a == b,
  );

  await Promise.all(
    uniqueStops.map((s) =>
      // getDepartures<TimetablePossibility, Departure>(
      getDepartures<GtfsPossibility, Departure>(
        // new TimetableDepartureSource(ctx),
        new GtfsDepartureSource(ctx),
        s,
        time,
        buckets.filter((b) => b.stop == s),
        // (x) => specificizeDeparture(ctx, x.entry, x.date, x.perspectiveIndex),
        (x) =>
          specificizeGtfsDeparture(
            ctx,
            x.trip,
            x.gtfsCalendarID,
            x.date,
            x.perspectiveIndex,
          ),
      ),
    ),
  );

  return buckets.map((b) => b.items.map((d) => d.toJSON()));
}
