import { nonNull } from "@schel-d/js-utils";
import { QDayOfWeek } from "../../shared/qtime/qdayofweek";
import { requireLine, requireStop } from "../../shared/system/config-utils";
import { StopID } from "../../shared/system/ids";
import { PlatformFilteringData } from "../config/platform-rules";
import { TrainQuery } from "../trainquery";
import { Possibility } from "./get-possibilities";

export function guessPlatformOfPossibility(
  ctx: TrainQuery,
  possibility: Possibility
) {
  const line = requireLine(
    ctx.getConfig(),
    possibility.entry.line
  );
  const stopList = line.route.requireStops(possibility.entry.route, possibility.entry.direction);
  const perspective = stopList[possibility.perspectiveIndex];

  const stops = possibility.entry.rows.map((r, i) => r != null ? stopList[i] : null).filter(nonNull);

  return guessPlatform(ctx, perspective, {
    line: possibility.entry.line,
    color: line.color,
    direction: possibility.entry.direction,
    routeVariant: possibility.entry.route,
    serviceType: line.serviceType,
    origin: stops[0],
    stops: stops,
    terminus: stops[stops.length - 1],
    dayOfWeek: QDayOfWeek.fromDate(possibility.date),
  });
}

function guessPlatform(
  ctx: TrainQuery,
  stop: StopID,
  service: PlatformFilteringData
) {
  const platforms = requireStop(ctx.getConfig(), stop).platforms;

  // This only really gets interesting if there are at least two platforms.
  if (platforms.length == 0) {
    return null;
  }
  if (platforms.length == 1) {
    return {
      confidence: "high",
      platform: platforms[0].id,
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
      platform: eligiblePlatforms[0],
    };
  }

  // If there's multiple platforms it could be, then we won't speculate any
  // further.
  return null;
}
