import { nullableEquals, unique } from "@schel-d/js-utils";
import { HasSharedConfig, requireLine } from "../../shared/system/config-utils";
import {
  DirectionID,
  LineID,
  RouteVariantID,
  StopID,
} from "../../shared/system/ids";
import {
  ContinuationOption,
  getContinuationOptions,
} from "../config/continuation-options";

export type MatchedRoute<T> = {
  line: LineID;
  associatedLines: LineID[];
  route: RouteVariantID;
  direction: DirectionID;
  values: (T | null)[];
  stopCount: number;
  continuation: MatchedRoute<T> | null;
};

export function matchToRoute<T>(
  config: HasSharedConfig,
  stoppingOrder: { stop: StopID; value: T }[],
  options: ContinuationOption[] | null = null,
): MatchedRoute<T> | null {
  const combinations = getCombinations(config, options);

  const matches: Omit<MatchedRoute<T>, "associatedLines">[] = [];
  for (const combination of combinations) {
    // Build the stopping pattern by slotting in the stops in the stopping order
    // as soon as possible.
    const stoppingPattern: (T | null)[] = [];
    let currInOrder = 0;
    for (const stop of combination.stops) {
      if (currInOrder == stoppingOrder.length) {
        stoppingPattern.push(null);
      } else {
        const curr = stoppingOrder[currInOrder];
        if (stop == curr.stop) {
          stoppingPattern.push(curr.value);
          currInOrder++;
        } else {
          stoppingPattern.push(null);
        }
      }
    }

    if (currInOrder == stoppingOrder.length) {
      // If we got through every stop in the stopping order, then this stop list
      // has matched!
      matches.push({
        line: combination.line,
        route: combination.route,
        direction: combination.direction,
        values: stoppingPattern,
        stopCount: currInOrder,
        continuation: null,
      });
    } else if (
      currInOrder > 1 &&
      stoppingPattern[stoppingPattern.length - 1] != null
    ) {
      // If we still have stops to get through and we stopped at this route's
      // terminus, maybe the remaining stops come from a continuation?
      // We check currInOrder > 1 because it's silly if the terminus is the ONLY
      // stop that matched!
      const options = getContinuationOptions(
        config,
        combination.line,
        combination.route,
        combination.direction,
      );

      if (options.length != 0) {
        // Attempt to match the future stops to the continuation options we
        // found above. Be sure to include the previous terminus (the
        // continuation's origin) in the stoplist. Because we know it stopped at
        // the first service's terminus, currInOrder will always be at least 1.
        const futureStoppingOrder = stoppingOrder.slice(currInOrder - 1);
        const continuation = matchToRoute(config, futureStoppingOrder, options);

        if (continuation != null) {
          matches.push({
            line: combination.line,
            route: combination.route,
            direction: combination.direction,
            values: stoppingPattern,
            stopCount: currInOrder,
            continuation: continuation,
          });
        }
      }
    }
  }

  if (matches.length == 0) {
    return null;
  }

  // Sort the matches to find the best one.
  const sortedMatches = matches.sort((a, b) => {
    if (a.stopCount != b.stopCount) {
      // The best matches match the most stops in the first trip (rely on
      // continuations as little as possible.)
      return -(a.stopCount - b.stopCount);
    } else {
      // If there are multiple matches matching the same number of stops,
      // prioritize the shorter ones (e.g. use direct over hooked route variants
      // if possible).
      return a.values.length - b.values.length;
    }
  });
  const bestMatches = sortedMatches.filter(
    (m) => m.stopCount == sortedMatches[0].stopCount,
  );

  const allLines = unique(
    bestMatches
      .filter((m) =>
        nullableEquals(m.continuation, bestMatches[0].continuation, sameRoute),
      )
      .map((m) => m.line),
    (a, b) => a == b,
  );

  return {
    ...bestMatches[0],
    associatedLines: allLines.filter((x) => x != bestMatches[0].line),
  };
}

function getCombinations(
  config: HasSharedConfig,
  options: ContinuationOption[] | null,
) {
  if (options != null) {
    return options.map((o) => ({
      ...o,
      stops: requireLine(config, o.line).route.requireStopList(
        o.route,
        o.direction,
      ).stops,
    }));
  }

  // Otherwise return every possible combination of line, route, and direction.
  return config.shared.lines
    .map((l) =>
      l.route.getStopLists().map((s) => ({
        line: l.id,
        route: s.variant,
        direction: s.direction,
        stops: s.stops,
      })),
    )
    .flat();
}

function sameRoute<T>(a: MatchedRoute<T>, b: MatchedRoute<T>): boolean {
  return (
    a.line == b.line &&
    a.route == b.route &&
    a.direction == b.direction &&
    nullableEquals(a.continuation, b.continuation, sameRoute)
  );
}
