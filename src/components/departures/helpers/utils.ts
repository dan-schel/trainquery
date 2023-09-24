import type { ContinuifyResult } from "./continuify";
import { requireLine, requireStop } from "shared/system/config-utils";
import { getConfig } from "@/utils/get-config";
import type { Departure } from "shared/system/timetable/departure";
import type { StopID } from "shared/system/ids";
import { formatDuration, formatRelativeTime } from "@/utils/format-qtime";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import type { QUtcDateTime } from "shared/qtime/qdatetime";
import { listifyAnd } from "@schel-d/js-utils";

export function getTerminusString(detail: ContinuifyResult) {
  const stopID = detail[detail.length - 1].stop;
  return requireStop(getConfig(), stopID).name;
}

export function getViaString(detail: ContinuifyResult) {
  const servedStops = detail.filter((s) => s.type == "served");
  const doesContinue = detail[detail.length - 1].stintIndex != 0;

  const thisStop = detail[0].stop;
  const lastStop = detail[detail.length - 1].stop;

  for (const rule of getConfig().frontend.via) {
    // Don't use this rule if some stops are not served.
    if (rule.stops.some((x) => servedStops.some((s) => s.stop != x))) {
      continue;
    }

    // Don't use this rule if it's for continuing trains only and this train isn't.
    if (rule.onlyIfContinuing && !doesContinue) {
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

export function getPlatformString(departure: Departure, perspective: StopID) {
  const platform = departure.perspective.platform;
  if (platform == null) {
    return null;
  }
  const name = requireStop(getConfig(), perspective).platforms.find(
    (p) => p.id == platform.id
  )?.name;
  if (name == null) {
    throw new Error(
      `Platform '${platform.id}' at stop '${perspective}' not found.`
    );
  }
  return platform.confidence == "high" ? name : `${name}?`;
}

export function getTimeString(departure: Departure, now: QUtcDateTime) {
  // TODO: Use live time when available.
  const time = departure.perspective.scheduledTime;
  const diff = time.diff(now);
  if (diff.isNegative) {
    return formatDuration(diff, { round: true });
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
