import { getConfig } from "@/utils/get-config";
import { requireLine } from "shared/system/config-utils";
import type { StopID } from "shared/system/ids";
import type { Service } from "shared/system/timetable/service";
import type { ServedStop } from "shared/system/timetable/service-stop";
import {
  CompleteStoppingPattern,
  PartialStoppingPattern,
} from "shared/system/timetable/stopping-pattern";

export type ContinuifiedServedStop = {
  type: "served";
  stop: StopID;
  stopListIndex: number;
  stintIndex: number;
  stint: Service;
  detail: ServedStop | null;
};
export type ContinuifiedExpressStop = {
  type: "express";
  stop: StopID;
  stopListIndex: number;
  stintIndex: number;
  stint: Service;
};
export type ContinuifiedUnknownStop = {
  type: "unknown";
  stop: StopID;
  stopListIndex: number;
  stintIndex: number;
  stint: Service;
};

export type ContinuifiedStop =
  | ContinuifiedServedStop
  | ContinuifiedExpressStop
  | ContinuifiedUnknownStop;

export function getContinuifiedStops(
  stint: Service,
  previousStintTerminus: StopID | null
) {
  if (stint.stoppingPattern instanceof CompleteStoppingPattern) {
    return complete(stint.stoppingPattern);
  } else {
    return partial(stint.stoppingPattern, stint, previousStintTerminus);
  }
}

function complete(pattern: CompleteStoppingPattern) {
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

function partial(
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
