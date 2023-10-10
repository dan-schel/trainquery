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

export function getTerminusString(
  departure: Departure,
  patternList: PatternList
) {
  if (departure.isArrival()) {
    return "Arrival";
  }
  return requireStop(getConfig(), patternList[patternList.length - 1].stop)
    .name;
}

export function getViaString(departure: Departure, patternList: PatternList) {
  const servedStops = patternList.filter((x) => x.type == "served");

  const thisStop = departure.perspective.stop;
  const lastStop = patternList[patternList.length - 1].stop;

  for (const rule of getConfig().frontend.via) {
    // Don't use this rule if some stops are not served.
    if (rule.stops.some((x) => servedStops.some((s) => s.stop != x))) {
      continue;
    }

    // Don't use this rule if it's for continuing trains only and this train isn't.
    if (rule.onlyIfContinuing && departure.continuation == null) {
      continue;
    }

    // Don't use this rule if it refers to the first or last stop.
    if (rule.stops.includes(thisStop) || rule.stops.includes(lastStop)) {
      continue;
    }

    return rule.text;
  }
  return null;
}

export function getPlatformString(departure: Departure) {
  const platform = departure.perspective.platform;
  if (platform == null) {
    return null;
  }

  const name = requirePlatform(
    getConfig(),
    departure.perspective.stop,
    platform.id
  ).name;
  return platform.confidence == "low" ? `${name}?` : name;
}

export function getTimeString(departure: Departure, now: QUtcDateTime) {
  // TODO: Use live time when available.
  const time = departure.perspective.scheduledTime;
  const diff = time.diff(now);
  if (diff.isNegative) {
    return formatDuration(diff, { round: true });
  }
  if (diff.inMins < 1) {
    return "Now";
  }
  if (diff.inHrs <= 2) {
    return formatDuration(diff);
  }

  const localTime = toLocalDateTimeLuxon(getConfig(), time);
  const nowLocalTime = toLocalDateTimeLuxon(getConfig(), now);
  return formatRelativeTime(localTime, nowLocalTime);
}

export function getLinesString(departure: Departure) {
  const lineNames = [departure.line, ...departure.associatedLines]
    .map((l) => requireLine(getConfig(), l).name)
    .sort((a, b) => a.localeCompare(b));
  return `${listifyAnd(lineNames)} ${lineNames.length == 1 ? "Line" : "lines"}`;
}
