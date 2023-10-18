import { type HasSharedConfig } from "../config-utils";
import {
  type DirectionID,
  type LineID,
  type RouteVariantID,
  type StopID,
} from "../ids";

export type MatchedRoute<T> = {
  line: LineID;
  associatedLines: LineID[];
  route: RouteVariantID;
  direction: DirectionID;
  values: (T | null)[];
};

export function matchToRoute<T>(
  config: HasSharedConfig,
  stoppingOrder: { stop: StopID; value: T }[]
): MatchedRoute<T> | null {
  const combinations = config.shared.lines
    .map((l) =>
      l.route.getStopLists().map((s) => ({
        line: l.id,
        route: s.variant,
        direction: s.direction,
        stops: s.stops,
      }))
    )
    .flat();

  let successful: MatchedRoute<T> | null = null;
  for (const combination of combinations) {
    // Build the stopping pattern by slotting in the stops in the stopping order
    // as soon as possible.
    const stoppingPattern: (T | null)[] = [];
    let currInOrder = 0;
    for (const stop of combination.stops) {
      const curr = stoppingOrder[currInOrder];
      if (stop == curr.stop) {
        stoppingPattern.push(curr.value);
        currInOrder++;
        if (currInOrder == stoppingOrder.length) {
          break;
        }
      } else {
        stoppingPattern.push(null);
      }
    }

    // If we got through every stop in the stopping order, then this stop list
    // has matched!
    if (currInOrder == stoppingOrder.length) {
      if (successful == null) {
        successful = {
          line: combination.line,
          associatedLines: [],
          route: combination.route,
          direction: combination.direction,
          values: stoppingPattern,
        };
      } else {
        // And if it's not the only stop list that matched, mark this line down
        // as an associated line.
        if (!successful.associatedLines.includes(combination.line)) {
          successful.associatedLines.push(combination.line);
        }
      }
    }
  }

  return successful;
}
