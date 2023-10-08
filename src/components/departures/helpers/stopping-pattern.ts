import { requireStop } from "shared/system/config-utils";
import type { ContinuifyStop } from "./continuify";
import { getConfig } from "@/utils/get-config";
import type { StopID } from "shared/system/ids";
import { listifyAnd } from "@schel-d/js-utils";
import { Departure } from "shared/system/timetable/departure";
import { CompleteStoppingPattern } from "shared/system/timetable/stopping-pattern";

export function getStoppingPatternString(trimmed: ContinuifyStop[]): string {
  const firstUnknownStint = trimmed.find(
    (s) => s.type == "unknown"
  )?.stintIndex;
  if (firstUnknownStint == 0) {
    return "Unknown stopping pattern";
  } else if (firstUnknownStint != null) {
    return getStoppingPatternString(
      trimmed.filter((s) => s.stintIndex < firstUnknownStint)
    );
  }

  const name = (stop: StopID) => requireStop(getConfig(), stop).name;

  // Note that arrivals are processed outside this function, so there should
  // always be at least two served stops in the list.
  const stops = trimmed.map((x, i) => ({
    name: name(x.stop),
    express: x.type != "served",
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

export function getArrivalDetailString(departure: Departure) {
  // Need to use departure in this function, because detail only includes stops
  // in the future.

  const origin = (() => {
    if (departure.stoppingPattern instanceof CompleteStoppingPattern) {
      return departure.stoppingPattern.trim()[0].stop;
    } else if (departure.stoppingPattern.origin != null) {
      return departure.stoppingPattern.origin.stop;
    }
    return null;
  })();

  if (origin == null) {
    return null;
  }
  return `Arrival from ${requireStop(getConfig(), origin).name}`;
}
