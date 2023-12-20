import { requireStop } from "../../shared/system/config-utils";
import { PlatformID, StopID } from "../../shared/system/ids";
import { TrainQuery } from "../trainquery";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { QDate } from "../../shared/qtime/qdate";
import { ConfidenceLevel } from "../../shared/system/enums";
import { PlatformFilteringData, getPlatformFilteringData } from "./filtering";
import { GtfsTrip } from "../gtfs/data/gtfs-trip";

export function guessPlatformsOfEntry(
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate,
) {
  const data = getPlatformFilteringData(ctx, entry, date);
  return data.routeStopList.map((s, i) =>
    entry.rows[i] != null ? guessPlatform(ctx, s, data) : null,
  );
}
export function guessPlatformsOfTrip(
  ctx: TrainQuery,
  entry: GtfsTrip,
  date: QDate,
) {
  const data = getPlatformFilteringData(ctx, entry, date);
  return data.routeStopList.map((s, i) =>
    entry.times[i] != null ? guessPlatform(ctx, s, data) : null,
  );
}

export function guessPlatform(
  ctx: TrainQuery,
  stop: StopID,
  service: PlatformFilteringData,
): {
  id: PlatformID;
  confidence: ConfidenceLevel;
} | null {
  const platforms = requireStop(ctx.getConfig(), stop).platforms;

  // This only really gets interesting if there are at least two platforms.
  if (platforms.length == 0) {
    return null;
  }
  if (platforms.length == 1) {
    return {
      confidence: "high",
      id: platforms[0].id,
    };
  }

  const rulesForStop = ctx.getConfig().server.platformRules.get(stop);
  if (rulesForStop == null) {
    // If this platform has no rules defined, then we have no idea which
    // platform it would be.
    return null;
  }

  const eligiblePlatforms = requireStop(ctx.getConfig(), stop)
    .platforms.map((p) => p.id)
    .filter((p) => {
      const rulesForPlatform = rulesForStop.rules.get(p);
      if (rulesForPlatform == null) {
        // If this platform has no rules defined, then it accepts all trains!
        return true;
      }
      return rulesForPlatform.some((x) => x.matches(service));
    });

  if (eligiblePlatforms.length == 1) {
    return {
      confidence: rulesForStop.confidence,
      id: eligiblePlatforms[0],
    };
  }

  // If there's multiple platforms it could be, then we won't speculate any
  // further.
  return null;
}
