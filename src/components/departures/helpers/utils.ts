import {
  requireLine,
  requirePlatform,
  requireStop,
} from "shared/system/config-utils";
import { getConfig } from "@/utils/get-config";
import { formatDuration, formatRelativeTime } from "shared/qtime/format";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import type { QUtcDateTime } from "shared/qtime/qdatetime";
import { listifyAnd } from "@dan-schel/js-utils";
import type { PatternList } from "shared/system/service/listed-stop";
import type { Departure } from "shared/system/service/departure";
import type { PlatformID, StopID } from "shared/system/ids";
import type { ConfidenceLevel } from "shared/system/enums";
import type { ViaRuleFilteringData } from "shared/system/via-rule";
import type { QDuration } from "shared/qtime/qduration";
import type { Disruption } from "shared/disruptions/processed/disruption";

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
    .filter((x) => x.type === "served");

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
  return platform.confidence === "low" ? `${name}?` : name;
}

export function getTimeStrings(departure: Departure, now: QUtcDateTime) {
  const scheduledTime = departure.perspective.scheduledTime;
  const liveTime = departure.perspective.liveTime;
  const effectiveTime = liveTime ?? scheduledTime;
  const delayString = getDelayString(liveTime, scheduledTime);
  const scheduledString = getScheduledString(scheduledTime, now);

  const diff = effectiveTime.diff(now);
  const scheduledDiff = scheduledTime.diff(now);

  const formatDiff = (diff: QDuration) =>
    diff.inMins < 1 && !diff.isNegative ? "Now" : formatDuration(diff);

  if (Math.abs(scheduledDiff.inHrs) <= 2) {
    const primary = formatDiff(diff);
    const struckout = formatDiff(scheduledDiff);
    return {
      primary: primary,
      struckout: struckout !== primary ? struckout : null,
      delay: delayString,
      schedule: `Scheduled for ${scheduledString}`,
    };
  }

  return {
    primary: scheduledString,
    struckout: null,
    delay: null,
    schedule: null,
  };
}

export function getDelayString(
  liveTime: QUtcDateTime | null,
  scheduledTime: QUtcDateTime,
  { capitalize = true }: { capitalize?: boolean } = {},
) {
  if (liveTime == null) {
    return null;
  }
  const delayMins = liveTime.diff(scheduledTime).inMins;
  if (delayMins === 0) {
    return {
      text: capitalize ? "On time" : "on time",
      type: "positive" as const,
    };
  } else if (delayMins > 0) {
    return {
      text: `${delayMins.toFixed()} ${delayMins === 1 ? "min" : "mins"} late`,
      type:
        delayMins < 2
          ? ("positive" as const)
          : delayMins < 5
            ? ("medium" as const)
            : ("negative" as const),
    };
  } else {
    return {
      text: `${(-delayMins).toFixed()} ${
        delayMins === -1 ? "min" : "mins"
      } early?`,
      type: "neutral" as const,
    };
  }
}

function getScheduledString(scheduledTime: QUtcDateTime, now: QUtcDateTime) {
  const scheduledLocalTime = toLocalDateTimeLuxon(getConfig(), scheduledTime);
  const nowLocalTime = toLocalDateTimeLuxon(getConfig(), now);
  return formatRelativeTime(scheduledLocalTime, nowLocalTime);
}

export function getLinesString(departure: Departure) {
  const lineNames = [departure.line, ...departure.associatedLines]
    .map((l) => requireLine(getConfig(), l).name)
    .sort((a, b) => a.localeCompare(b));
  return `${listifyAnd(lineNames)} ${
    lineNames.length === 1 ? "Line" : "lines"
  }`;
}

export function getDisruptionsString(disruptions: Disruption[]): string | null {
  if (disruptions.length === 0) {
    return null;
  }

  return `Possibly affected by ${disruptions.length.toFixed()} ${
    disruptions.length === 1 ? "disruption" : "disruptions"
  }`;
}
