import { BadApiCallError, handle } from "./api-handler";
import { departuresApi } from "../../shared/api/departures-api";
import { getDepartures } from "../timetable/get-departures";
import { specificizeGtfsDeparture } from "../timetable/specificize";
import { unique } from "@dan-schel/js-utils";
import {
  GtfsDepartureSource,
  GtfsPossibility,
} from "../departures/gtfs-departure-source";
import { Departure } from "../../shared/system/service/departure";
import { FilteredBucket } from "../departures/filtered-bucket";
import { PtvPlatformsServiceTransform } from "../service/transforms/ptv-platforms/ptv-platforms";
import { PtvPlatformsSubsystem } from "../subsystem/ptv-platforms/ptv-platforms";
import { CompletePattern } from "../../shared/system/service/complete-pattern";

const maxFeeds = 10;
const maxCount = 20;

export const departuresApiHandler = handle(
  departuresApi,
  async (ctx, { feeds, time }) => {
    if (feeds.length > maxFeeds || feeds.some((f) => f.count > maxCount)) {
      throw new BadApiCallError(
        `Too many feeds or too many departures per feed.`,
      );
    }

    const buckets = feeds.map(
      (f) => new FilteredBucket<Departure>(ctx, f.stop, f.count, f.filter),
    );
    const uniqueStops = unique(
      feeds.map((f) => f.stop),
      (a, b) => a === b,
    );

    const transforms = [
      new PtvPlatformsServiceTransform<CompletePattern>(
        ctx.subsystems.require(PtvPlatformsSubsystem),
      ),
    ];

    if (ctx.gtfs != null) {
      const data = await ctx.gtfs.getData();
      if (data != null) {
        await Promise.all(
          uniqueStops.map((s) =>
            // getDepartures<TimetablePossibility, Departure>(
            getDepartures<GtfsPossibility, Departure>(
              // new TimetableDepartureSource(ctx),
              new GtfsDepartureSource(ctx, data),
              s,
              time,
              buckets.filter((b) => b.stop === s),
              // (x) => specificizeDeparture(ctx, x.entry, x.date, x.perspectiveIndex),
              (x) =>
                specificizeGtfsDeparture(
                  ctx,
                  x.trip,
                  x.gtfsCalendarID,
                  x.date,
                  x.perspectiveIndex,
                  transforms,
                ),
            ),
          ),
        );
      } else {
        // TODO: Fall back on static ttbl data.
        // eslint-disable-next-line no-console
        console.log("Departures empty since GTFS is not loaded yet.");
      }
    }

    return buckets.map((b) =>
      b.items.map((d) => ctx.disruptions.attachDisruptions(d)),
    );
  },
);
