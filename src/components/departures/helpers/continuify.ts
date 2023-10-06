import { getConfig } from "@/utils/get-config";
import { requireLine } from "shared/system/config-utils";
import type { StopID } from "shared/system/ids";
import { Departure } from "shared/system/timetable/departure";
import type { Service } from "shared/system/timetable/service";
import type { ServedStop } from "shared/system/timetable/service-stop";
import { CompleteStoppingPattern } from "shared/system/timetable/stopping-pattern";

export type ContinuifyResult = (
  | {
      type: "express";
      stop: StopID;
      stintIndex: number;
    }
  | {
      type: "served";
      stop: StopID;
      stintIndex: number;
      detail: ServedStop | null;
    }
  | {
      type: "unknown";
      stop: StopID;
      stintIndex: number;
    }
)[];

/** Return the part of the stopping pattern we care about. */
export function continuify(
  departure: Departure,
  continuationsEnabled: boolean
): ContinuifyResult {
  const stints: Service[] = [];
  if (!continuationsEnabled || departure.continuation == null) {
    stints.push(departure);
  } else {
    let service: Service | null = departure;
    while (service != null) {
      stints.push(service);
      service = service.continuation;
    }
  }

  return merge(stints, departure.perspectiveIndex);
}

function merge(stints: Service[], start: number): ContinuifyResult {
  const result: ContinuifyResult = [];

  let totalStopIndex = 0;
  const seen = new Set<StopID>();

  for (let i = 0; i < stints.length; i++) {
    const stint = stints[i];
    const stopList = requireLine(getConfig(), stint.line).route.requireStops(
      stint.route,
      stint.direction
    );

    // We know the first stint has originated, but for the others we need to
    // wait for the first stop.
    let hasOriginated = i == 0;
    let uncommitted: ContinuifyResult = [];

    for (let j = 0; j < stopList.length; j++) {
      if (seen.has(stopList[j]) && i != 0) {
        // Stop here, we've already seen this stop before.
        return result;
      } else if (totalStopIndex >= start) {
        const entry = continuifiedStopFor(stint, j, stopList[j], i);

        if (hasOriginated || entry.type == "served") {
          uncommitted.push(entry);
          hasOriginated = true;
          if (entry.type == "served" && uncommitted.length != 0) {
            result.push(...uncommitted);
            uncommitted = [];
          }
        }

        if (entry.type != "express") {
          seen.add(stopList[j]);
        }
      }

      totalStopIndex++;
    }
  }

  // TODO: Remove duplicate stops due to the continuation stop being added
  // twice. The terminus stop for services that continue should be removed.

  return result;
}

function continuifiedStopFor(
  service: Service,
  index: number,
  stop: StopID,
  stintIndex: number
): ContinuifyResult[number] {
  if (stintIndex == 0) {
    if (service instanceof Departure) {
      if (index == service.perspectiveIndex) {
        return {
          type: "served",
          stop: service.perspective.stop,
          detail: service.perspective,
          stintIndex: stintIndex,
        };
      }
    } else {
      throw new Error("First stint was not a departure?");
    }
  }

  if (service.stoppingPattern instanceof CompleteStoppingPattern) {
    const detail = service.stoppingPattern.stops[index];
    if (detail.express) {
      return {
        type: "express",
        stop: detail.stop,
        stintIndex: stintIndex,
      };
    } else {
      return {
        type: "served",
        stop: detail.stop,
        detail: detail,
        stintIndex: stintIndex,
      };
    }
  } else {
    const terminusIndex = service.stoppingPattern.terminus.index;
    const originIndex = service.stoppingPattern.origin?.index ?? 0;
    if (index == terminusIndex || index == originIndex) {
      return {
        type: "served",
        stop: stop,
        detail: null,
        stintIndex: stintIndex,
      };
    } else if (index < originIndex || index > terminusIndex) {
      return {
        type: "express",
        stop: stop,
        stintIndex: stintIndex,
      };
    } else {
      return {
        type: "unknown",
        stop: stop,
        stintIndex: stintIndex,
      };
    }
  }
}
