import { nonNull } from "@schel-d/js-utils";
import { QDayOfWeek } from "../../shared/qtime/qdayofweek";
import { requireLine, requireStop } from "../../shared/system/config-utils";
import { PlatformID, StopID } from "../../shared/system/ids";
import { PlatformFilteringData } from "../config/platform-rules";
import { TrainQuery } from "../trainquery";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { QDate } from "../../shared/qtime/qdate";
import { ConfidenceLevel } from "../../shared/system/enums";
import { Possibility } from "../departures/timetable-departure-source";

function createPlatformGuesser(ctx: TrainQuery, entry: FullTimetableEntry) {
  const line = requireLine(ctx.getConfig(), entry.line);
  const stopList = line.route.requireStops(entry.route, entry.direction);
  const stops = entry.rows
    .map((r, i) => (r != null ? stopList[i] : null))
    .filter(nonNull);
  const data = {
    line: entry.line,
    color: line.color,
    direction: entry.direction,
    routeVariant: entry.route,
    serviceType: line.serviceType,
    origin: stops[0],
    stops: stops,
    terminus: stops[stops.length - 1],
  };
  return {
    guesser: (perspective: StopID, date: QDate) =>
      guessPlatform(ctx, perspective, {
        ...data,
        dayOfWeek: QDayOfWeek.fromDate(date),
      }),
    stopList: stopList,
  };
}

export function guessPlatformOfPossibility(
  ctx: TrainQuery,
  possibility: Possibility,
) {
  const { guesser, stopList } = createPlatformGuesser(ctx, possibility.entry);
  return guesser(stopList[possibility.perspectiveIndex], possibility.date);
}

export function guessPlatformsOfEntry(
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate,
) {
  const { guesser, stopList } = createPlatformGuesser(ctx, entry);
  return stopList.map((s, i) =>
    entry.rows[i] != null ? guesser(s, date) : null,
  );
}

function guessPlatform(
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
