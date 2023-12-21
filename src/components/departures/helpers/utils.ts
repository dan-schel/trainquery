import {
  requireLine,
  requirePlatform,
  requireStop,
} from "shared/system/config-utils";
import { getConfig } from "@/utils/get-config";
import { formatDuration, formatRelativeTime } from "@/utils/format-qtime";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import type { QUtcDateTime } from "shared/qtime/qdatetime";
import { listifyAnd } from "@schel-d/js-utils";
import type { PatternList } from "shared/system/service/listed-stop";
import type { Departure } from "shared/system/service/departure";
import type { PlatformID, StopID } from "shared/system/ids";
import type { ConfidenceLevel } from "shared/system/enums";
import type { ViaRuleFilteringData } from "shared/system/via-rule";
import type { SerializedDisruption } from "shared/disruptions/serialized-disruption";

export function getTerminusString(
  departure: Departure,
  patternList: PatternList,
) {
  if (departure.isArrival()) {
    return "Arrival";
  }
  return requireStop(getConfig(), patternList[patternList.length - 1].stop)
    .name;
}

export function getViaString(departure: Departure, patternList: PatternList) {
  const servedStops = patternList
    .slice(1, -1)
    .filter((x) => x.type == "served");

  const line = requireLine(getConfig(), departure.line);
  const data: ViaRuleFilteringData = {
    line: departure.line,
    color: line.color,
    direction: departure.direction,
    routeVariant: departure.route,
    serviceType: line.serviceType,
    futureStops: servedStops.map((s) => s.stop),
    terminus: departure.terminus.stop,
    continues: departure.continuation != null,
  };

  // Return the first matching rule.
  for (const rule of getConfig().frontend.via) {
    if (rule.rules.some((r) => r.matches(data))) {
      return rule.text;
    }
  }

  return null;
}

export function getDeparturePlatformString(departure: Departure) {
  return getPlatformString(
    departure.perspective.platform,
    departure.perspective.stop,
  );
}

export function getPlatformString(
  platform: { id: PlatformID; confidence: ConfidenceLevel } | null,
  perspectiveStop: StopID,
) {
  if (platform == null) {
    return null;
  }

  const name = requirePlatform(getConfig(), perspectiveStop, platform.id).name;
  return platform.confidence == "low" ? `${name}?` : name;
}

export function getTimeStrings(departure: Departure, now: QUtcDateTime) {
  // TODO: Use live time when available.
  const time = departure.perspective.scheduledTime;

  const localTime = toLocalDateTimeLuxon(getConfig(), time);
  const nowLocalTime = toLocalDateTimeLuxon(getConfig(), now);
  const scheduledTime = formatRelativeTime(localTime, nowLocalTime);

  const diff = time.diff(now);
  if (diff.inMins < 1 && !diff.isNegative) {
    return {
      primary: "Now",
      secondary: `Scheduled for ${scheduledTime}`,
    };
  }
  if (Math.abs(diff.inHrs) <= 2) {
    return {
      primary: formatDuration(diff),
      secondary: `Scheduled for ${scheduledTime}`,
    };
  }

  return {
    primary: scheduledTime,
    secondary: null,
  };
}

export function getLinesString(departure: Departure) {
  const lineNames = [departure.line, ...departure.associatedLines]
    .map((l) => requireLine(getConfig(), l).name)
    .sort((a, b) => a.localeCompare(b));
  return `${listifyAnd(lineNames)} ${lineNames.length == 1 ? "Line" : "lines"}`;
}

export function getDisruptionsString(
  disruptions: SerializedDisruption[],
): string | null {
  if (disruptions.length == 0) {
    return null;
  }

  return `Possibly affected by ${disruptions.length.toFixed()} ${
    disruptions.length == 1 ? "disruption" : "disruptions"
  }`;
}
