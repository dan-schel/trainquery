import { requireStop } from "shared/system/config-utils";
import { getConfig } from "@/utils/get-config";
import type { StopID } from "shared/system/ids";
import { listifyAnd } from "@schel-d/js-utils";
import type { ContinuifiedDeparture } from "./continuified-departure";
import type { ContinuifiedStop } from "./continuified-stop";

export function getStoppingPatternString(
  departure: ContinuifiedDeparture
): string {
  if (departure.isArrival()) {
    const origin = departure.origin();
    if (origin.type != "served") {
      return "Unknown origin";
    } else {
      return `Arrival from ${requireStop(getConfig(), origin.stop).name}`;
    }
  }

  const firstUnknownStint = departure.relevant.find(
    (s) => s.type == "unknown"
  )?.stintIndex;

  if (firstUnknownStint == null) {
    // We know everything we need for the whole relevant bit of the service.
    return stoppingPattern(departure.relevant);
  } else if (firstUnknownStint > 0) {
    // Just work out the stopping pattern up to the first unknown bit.
    return stoppingPattern(
      departure.relevant.filter((s) => s.stintIndex < firstUnknownStint)
    );
  } else {
    // We don't know much at all.
    return "Unknown stopping pattern";
  }
}

function stoppingPattern(relevant: ContinuifiedStop[]) {
  const name = (stop: StopID) => requireStop(getConfig(), stop).name;

  // Note that arrivals are processed outside this function, so there should
  // always be at least two served stops in the list.
  const stops = relevant.map((x, i) => ({
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
