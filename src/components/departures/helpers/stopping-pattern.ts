import { requireLine, requireStop } from "shared/system/config-utils";
import type { ContinuifyResult } from "./continuify";
import { getConfig } from "@/utils/get-config";
import type { StopID } from "shared/system/ids";
import { listifyAnd } from "@schel-d/js-utils";
import { Departure } from "shared/system/timetable/departure";
import { CompleteStoppingPattern } from "shared/system/timetable/stopping-pattern";

export function getStoppingPatternString(detail: ContinuifyResult): string {
  const firstUnknownStint = detail.find((s) => s.type == "unknown")?.stintIndex;
  if (firstUnknownStint == 0) {
    return "Unknown stopping pattern";
  } else if (firstUnknownStint != null) {
    return getStoppingPatternString(
      detail.filter((s) => s.stintIndex < firstUnknownStint)
    );
  }

  const name = (stop: StopID) => requireStop(getConfig(), stop).name;

  // Note that arrivals are processed outside this function, so there should
  // always be at least two served stops in the list.
  const stops = detail.slice(1).map((x, i) => ({
    name: name(x.stop),
    express: x.type != "served",
    index: i,
  }));
  const served = stops.filter((s) => !s.express);
  const express = stops.filter((s) => s.express);
  if (served.length <= 3) {
    return `Stops at ${listifyAnd(served.map((s) => s.name))} only`;
  } else if (express.length <= 3) {
    return `Skips ${listifyAnd(served.map((s) => s.name))}`;
  } else if (served.length == stops.length) {
    return `Stops all stations to ${stops[stops.length - 1].name}`;
  }

  // Check for a (semi-)continuous run of express stops.
  const lastBeforeExpress = Math.min(...express.map((x) => x.index)) - 1;
  const firstAfterExpress = Math.max(...express.map((x) => x.index)) + 1;
  const servedInExpressSection = stops.slice(
    lastBeforeExpress,
    firstAfterExpress + 1
  );
  if (servedInExpressSection.length <= 4) {
    return `Express ${servedInExpressSection.map((x) => x.name).join(" → ")}`;
  }

  // Otherwise we give up.
  return "Limited express";
}

export function getArrivalDetailString(departure: Departure) {
  // Need to use departure in this function, because detail only includes stops in the future.

  const stopList = requireLine(getConfig(), departure.line).route.getStops(
    departure.route,
    departure.direction
  );

  if (departure.stoppingPattern instanceof CompleteStoppingPattern) {
    const firstStopIndex = departure.stoppingPattern.stops.findIndex(
      (s) => s != null
    );
    const origin = stopList[firstStopIndex];
    return `Arrival from ${requireStop(getConfig(), origin).name}`;
  } else {
    if (departure.stoppingPattern.originIndex == null) {
      return null;
    }
    const origin = stopList[departure.stoppingPattern.originIndex];
    return `Arrival from ${requireStop(getConfig(), origin).name}`;
  }
}
