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
import { GtfsFeedConfig } from "../config/gtfs-config";

export type MatchedRoute<T> = {
  line: LineID;
  route: RouteVariantID;
  direction: DirectionID;
  values: (T | null)[];
  stopCount: number;
  continuation: MatchedRoute<T> | null;
};

export type RouteOption = {
  line: LineID;
  route: RouteVariantID;
  direction: DirectionID;
  stops: StopID[];
};

export function matchToRoute<T>(
  config: HasSharedConfig,
  stoppingOrder: { stop: StopID; value: T }[],
  combinations: RouteOption[],
): MatchedRoute<T> | null {
  const matches: MatchedRoute<T>[] = [];
  for (const combination of combinations) {
    // Build the stopping pattern by slotting in the stops in the stopping order
    // as soon as possible.
    const stoppingPattern: (T | null)[] = [];
    let currInOrder = 0;
    for (const stop of combination.stops) {
      if (currInOrder === stoppingOrder.length) {
        stoppingPattern.push(null);
      } else {
        const curr = stoppingOrder[currInOrder];
        if (stop === curr.stop) {
          stoppingPattern.push(curr.value);
          currInOrder++;
        } else {
          stoppingPattern.push(null);
        }
      }
    }

    if (currInOrder === stoppingOrder.length) {
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

      if (options.length !== 0) {
        // Attempt to match the future stops to the continuation options we
        // found above. Be sure to include the previous terminus (the
        // continuation's origin) in the stoplist. Because we know it stopped at
        // the first service's terminus, currInOrder will always be at least 1.
        const futureStoppingOrder = stoppingOrder.slice(currInOrder - 1);
        const continuationCombinations = mapWithStopLists(config, options);
        const continuation = matchToRoute(
          config,
          futureStoppingOrder,
          continuationCombinations,
        );

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

  if (matches.length === 0) {
    return null;
  }

  // Sort the matches to find the best one.
  const sortedMatches = matches.sort((a, b) => {
    if (a.stopCount !== b.stopCount) {
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
    (m) => m.stopCount === sortedMatches[0].stopCount,
  );

  return bestMatches[0];
}

function mapWithStopLists(
  config: HasSharedConfig,
  options: ContinuationOption[],
): RouteOption[] {
  return options.map((o) => ({
    ...o,
    stops: requireLine(config, o.line).route.requireStopList(
      o.route,
      o.direction,
    ).stops,
  }));
}

export function getCombinationsForRouteID(
  config: HasSharedConfig,
  feedConfig: GtfsFeedConfig,
  routeID: string,
): RouteOption[] {
  return config.shared.lines
    .filter((l) =>
      feedConfig
        .getParsingRulesForLine(l.id)
        .routeIDRegex.some((r) => r.test(routeID)),
    )
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
