import { requireStop } from "shared/system/config-utils";
import { getConfig } from "@/utils/get-config";
import type { StopID } from "shared/system/ids";
import { listifyAnd } from "@schel-d/js-utils";
import type { Departure } from "shared/system/service/departure";
import type { PatternList } from "shared/system/service/listed-stop";
import { CompletePattern } from "shared/system/service/complete-pattern";

export function getStoppingPatternString(
  departure: Departure,
  patternList: PatternList,
): string {
  const name = (stop: StopID) => requireStop(getConfig(), stop).name;

  if (departure.isArrival()) {
    if (departure.pattern instanceof CompletePattern) {
      return `Arrival from ${name(departure.pattern.origin.stop)}`;
    } else {
      return "Unknown origin";
    }
  }

  if (patternList.some((x) => x.type === "unknown")) {
    return "Unknown stopping pattern";
  }

  // Note that arrivals are processed outside this function, so there should
  // always be at least two served stops in the list.
  const stops = patternList.map((x, i) => ({
    name: name(x.stop),
    express: x.type !== "served",
    index: i,
  }));
  const served = stops.slice(1).filter((s) => !s.express);
  const express = stops.slice(1).filter((s) => s.express);
  if (served.length > 0 && served.length <= 3) {
    return `Stops at ${listifyAnd(served.map((s) => s.name))} only`;
  } else if (express.length > 0 && express.length <= 3) {
    return `Skips ${listifyAnd(express.map((s) => s.name))}`;
  } else if (stops.every((s) => !s.express)) {
    return `Stops all stations to ${stops[stops.length - 1].name}`;
  }

  // Check for a (semi-)continuous run of express stops.
  const lastBeforeExpress = Math.min(...express.map((x) => x.index)) - 1;
  const firstAfterExpress = Math.max(...express.map((x) => x.index)) + 1;
  const servedInExpressSection = stops
    .slice(lastBeforeExpress, firstAfterExpress + 1)
    .filter((x) => !x.express);
  if (
    servedInExpressSection.length >= 2 &&
    servedInExpressSection.length <= 4
  ) {
    return `Express ${servedInExpressSection.map((x) => x.name).join(" → ")}`;
  }

  // Otherwise we give up.
  return "Limited express";
}
