import { unique } from "@schel-d/js-utils";
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
        continuation: null,
      });
    } else if (stoppingPattern[stoppingPattern.length - 1] != null) {
      // If we still have stops to get through and we stopped at this route's
      // terminus, maybe the remaining stops come from a continuation?
      const options = getContinuationOptions(
        config,
        combination.line,
        combination.route,
        combination.direction,
      );

      if (options.length != 0) {
        // Attemt to match the future stops to the continuation options we found
        // above. Be sure to include the previous terminus (the continuation's
        // origin) in the stoplist. Because we know it stopped at the first
        // service's terminus, currInOrder will always be at least 1.
        const futureStoppingOrder = stoppingOrder.slice(currInOrder - 1);
        const continuation = matchToRoute(config, futureStoppingOrder, options);

        matches.push({
          line: combination.line,
          route: combination.route,
          direction: combination.direction,
          values: stoppingPattern,
          continuation: continuation,
        });
      }
    }
  }

  if (matches.length == 0) {
    return null;
  }

  return {
    ...matches[0],
    associatedLines: unique(
      matches.map((m) => m.line),
      (a, b) => a == b,
    ),
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
