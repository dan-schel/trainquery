import { getConfig } from "@/utils/get-config";
import { requireLine } from "shared/system/config-utils";
import type { StopID } from "shared/system/ids";
import { Departure } from "shared/system/timetable/departure";
import type { Service } from "shared/system/timetable/service";
import type { ServedStop } from "shared/system/timetable/service-stop";
import {
  CompleteStoppingPattern,
  PartialStoppingPattern,
} from "shared/system/timetable/stopping-pattern";

export type ContinuifyStop =
  | {
      type: "express";
      stop: StopID;
      stopListIndex: number;
      stintIndex: number;
      stint: Service;
    }
  | {
      type: "served";
      stop: StopID;
      stopListIndex: number;
      stintIndex: number;
      stint: Service;
      detail: ServedStop | null;
    }
  | {
      type: "unknown";
      stop: StopID;
      stopListIndex: number;
      stintIndex: number;
      stint: Service;
    };

export type ContinuifyResult = {
  all: ContinuifyStop[];
  trimmed: ContinuifyStop[];
};

/** Return the part of the stopping pattern we care about. */
export function continuify(
  departure: Departure,
  continuationsEnabled: boolean
): ContinuifyResult {
  const stints: Service[] = [departure];

  let service: Service | null = departure.continuation;
  while (continuationsEnabled && service != null) {
    stints.push(service);
    service = service.continuation;
  }

  return merge(stints, departure.perspectiveIndex);
}

function merge(stints: Service[], start: number): ContinuifyResult {
  const all: ContinuifyStop[] = [];
  let previousStintTerminus: StopID | null = null;
  stints.forEach((s, i) => {
    const stops: ContinuifyStop[] = trimmedStops(s, previousStintTerminus).map(
      (x) => ({
        ...x,
        stintIndex: i,
        stint: s,
      })
    );

    previousStintTerminus = stops[stops.length - 1].stop;

    // To avoid duplicate terminii, remove the terminus of each service unless
    // it's the last stint.
    const stopsToPush = i < stints.length - 1 ? stops.slice(0, -1) : stops;
    all.push(...stopsToPush);
  });

  const trimmed = [];
  const seen = new Set<StopID>();
  let started = false;
  for (const stop of all) {
    if (stop.stintIndex != 0 || stop.stopListIndex >= start) {
      started = true;
    }

    if (started) {
      // Consider "unknown" to be the same as "served" for trimming purposes.
      if (stop.type != "express") {
        if (seen.has(stop.stop)) {
          // We've now come to a stop we've been to before, so trim the list
          // here. There's also no point including any express stops since the
          // last stop in the list, so let's trim them off now.
          while (trimmed[trimmed.length - 1].type == "express") {
            trimmed.splice(trimmed.length - 1, 1);
          }
        } else {
          seen.add(stop.stop);
        }
      }

      trimmed.push(stop);
    }
  }

  return {
    all: all,
    trimmed: trimmed,
  };
}

function trimmedStops(stint: Service, previousStintTerminus: StopID | null) {
  if (stint.stoppingPattern instanceof CompleteStoppingPattern) {
    return trimmedStopsComplete(stint.stoppingPattern);
  }
  return trimmedStopsPartial(
    stint.stoppingPattern,
    stint,
    previousStintTerminus
  );
}

function trimmedStopsComplete(pattern: CompleteStoppingPattern) {
  return pattern.trim().map((x) =>
    x.express
      ? {
          type: "express" as const,
          stop: x.stop,
          stopListIndex: x.stopListIndex,
        }
      : {
          type: "served" as const,
          stop: x.stop,
          stopListIndex: x.stopListIndex,
          detail: x,
        }
  );
}

function trimmedStopsPartial(
  pattern: PartialStoppingPattern,
  stint: Service,
  previousStintTerminus: StopID | null
) {
  const stopList = requireLine(getConfig(), stint.line).route.requireStopList(
    stint.route,
    stint.direction
  );

  const terminusIndex = pattern.terminus.index;
  const originIndex = (() => {
    // If we know the origin, use it.
    if (pattern.origin?.index != null) {
      return pattern.origin.index;
    }

    // Otherwise find the first known stop (if there are any).
    let bestGuess = pattern.additional.find((s) => !s.express)?.index ?? null;

    // If we know where the previous stint terminated, find the index of that
    // stop within the stop list.
    if (previousStintTerminus != null) {
      // If this stop list stops here multiple times, use the latest stop (to be
      // conservative). Don't use any stops before the terminus (which we know
      // with more certainty).
      const expectedOriginIndex = Math.max(
        ...stopList.stops
          .map((s, i) => ({ stop: s, index: i }))
          .filter(
            (s) => s.index < terminusIndex && s.stop == previousStintTerminus
          )
          .map((x) => x.index)
      );

      // Only use this stop if it's earlier that any known stops.
      if (bestGuess == null || expectedOriginIndex < bestGuess) {
        bestGuess = expectedOriginIndex;
      }
    }

    // If we literally know nothing at all, then just go with the first stop I
    // guess?
    return bestGuess ?? 0;
  })();

  const knownStops = pattern.getKnownStops();
  const knownExpress = pattern.additional
    .filter((x) => x.express)
    .map((x) => x.index);

  return stopList.stops.slice(originIndex, terminusIndex + 1).map((s, i) => {
    const index = i + originIndex;

    const known = knownStops.find((x) => x.index == index);
    if (known != null) {
      return {
        type: "served" as const,
        stop: s,
        stopListIndex: index,
        detail: known.detail,
      };
    } else if (knownExpress.includes(index)) {
      return {
        type: "express" as const,
        stop: s,
        stopListIndex: index,
      };
    } else {
      return {
        type: "unknown" as const,
        stop: s,
        stopListIndex: index,
      };
    }
  });
}
