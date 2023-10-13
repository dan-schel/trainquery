import { type HasSharedConfig, requireLine } from "../config-utils";
import { type StopID } from "../ids";
import { CompletePattern } from "./complete-pattern";
import { KnownOriginPattern } from "./known-origin-pattern";
import { ServedStop } from "./served-stop";
import { Service } from "./service";
import { SkippedStop } from "./skipped-stop";

export type ListedSkip = {
  type: "express";
  stop: StopID;
  stopListIndex: number;
};

export type ListedStop = {
  type: "served";
  stop: StopID;
  stopListIndex: number;
  detail: ServedStop | null;
};

export type ListedUnknown = {
  type: "unknown";
  stop: StopID;
  stopListIndex: number;
};

export type PatternListElement = ListedSkip | ListedStop | ListedUnknown;
export type PatternList = PatternListElement[];

export function listedFromServed(stop: ServedStop): ListedStop {
  return {
    type: "served",
    stop: stop.stop,
    stopListIndex: stop.stopListIndex,
    detail: stop,
  };
}

export function listedStop({
  stop,
  stopListIndex,
}: {
  stop: StopID;
  stopListIndex: number;
}): ListedStop {
  return {
    type: "served",
    stop,
    stopListIndex,
    detail: null,
  };
}

export function listedFromSkipped(stop: SkippedStop): ListedSkip {
  return {
    type: "express",
    stop: stop.stop,
    stopListIndex: stop.stopListIndex,
  };
}

export function listedUnknown(
  stop: StopID,
  stopListIndex: number
): ListedUnknown {
  return {
    type: "unknown",
    stop,
    stopListIndex,
  };
}

export function getPatternList(
  config: HasSharedConfig,
  service: Service
): PatternList {
  const pattern = service.pattern;
  if (pattern instanceof CompletePattern) {
    return pattern.stops
      .filter(
        (s) =>
          s.stopListIndex >= pattern.origin.stopListIndex &&
          s.stopListIndex <= pattern.terminus.stopListIndex
      )
      .map((x) => {
        if (!x.express) {
          return listedFromServed(x);
        } else {
          return listedFromSkipped(x);
        }
      });
  } else if (pattern instanceof KnownOriginPattern) {
    const stopList = requireLine(config, service.line).route.requireStopList(
      service.route,
      service.direction
    );
    const trimmed = stopList.stops.filter(
      (s, i) =>
        i >= pattern.origin.stopListIndex && i <= pattern.terminus.stopListIndex
    );
    return trimmed.map((x, i) => {
      if (i == 0) {
        return listedFromServed(pattern.origin);
      } else if (i == trimmed.length - 1) {
        return listedStop(pattern.terminus);
      } else {
        return listedUnknown(x, i + pattern.origin.stopListIndex);
      }
    });
  } else {
    const stopList = requireLine(config, service.line).route.requireStopList(
      service.route,
      service.direction
    );
    const trimmed = stopList.stops.filter(
      (s, i) => i <= pattern.terminus.stopListIndex
    );
    return trimmed.map((x, i) => {
      if (i == pattern.perspective.stopListIndex) {
        return listedFromServed(pattern.perspective);
      } else if (i == pattern.terminus.stopListIndex) {
        return listedStop(pattern.terminus);
      } else {
        // A stop either before the perspective or between it and the terminus.
        // (We don't even know where the origin is!)
        return listedUnknown(x, i);
      }
    });
  }
}
