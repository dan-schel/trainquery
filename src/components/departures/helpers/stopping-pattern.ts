import { requireStop } from "shared/system/config-utils";
import type { ContinuifyResult } from "./continuify";
import { getConfig } from "@/utils/get-config";
import type { StopID } from "shared/system/ids";
import { listifyAnd } from "@schel-d/js-utils";

export function getStoppingPatternString(detail: ContinuifyResult) {
  const firstUnknownStint = detail.find(s => s.type == "unknown")?.stintIndex;
  if (firstUnknownStint == 0) {
    return "Unknown stopping pattern";
  }
  else if (firstUnknownStint != null) {
    return getStoppingPatternString(detail.filter(s => s.stintIndex < firstUnknownStint));
  }

  const name = (stop: StopID) => requireStop(getConfig(), stop).name;

  // TODO: if there's only one stop in detail, then this is an arrival.

  const stops = detail.slice(1).map((x, i) => ({ name: name(x.stop), express: x.type != "served", index: i }));
  const served = stops.filter(s => !s.express);
  const express = stops.filter(s => s.express);
  if (served.length <= 3) {
    return `Stops at ${listifyAnd(served.map(s => s.name))} only`;
  }
  else if (express.length <= 3) {
    return `Skips ${listifyAnd(served.map(s => s.name))}`;
  }
  else if (served.length == stops.length) {
    return `Stops all stations to ${stops[stops.length - 1].name}`;
  }

  const lastBeforeExpress = Math.min(...express.map(x => x.index)) - 1;
  const firstAfterExpress = Math.max(...express.map(x => x.index)) + 1;

  // Express South Yarra -> Malvern, etc.

  return 'Limited express';
}
