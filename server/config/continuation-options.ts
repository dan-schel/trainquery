import {
  HasSharedConfig,
  getContinuationGroupForLine,
  requireLine,
} from "../../shared/system/config-utils";
import {
  HookContinuationGroup,
  LinearContinuationGroup,
} from "../../shared/system/continuation-group";
import { DirectionID, LineID, RouteVariantID } from "../../shared/system/ids";
import { HookRoute } from "../../shared/system/routes/hook-route";
import { LinearRoute } from "../../shared/system/routes/linear-route";

export type ContinuationOption = {
  line: LineID;
  route: RouteVariantID;
  direction: DirectionID;
};

export function getContinuationOptions(
  config: HasSharedConfig,
  line: LineID,
  routeVariant: RouteVariantID,
  direction: DirectionID,
): ContinuationOption[] {
  const group = getContinuationGroupForLine(config, line);
  if (group == null) {
    return [];
  }

  const route = requireLine(config, line).route;

  if (group instanceof LinearContinuationGroup) {
    if (!(route instanceof LinearRoute)) {
      throw new Error("LinearContinuationGroup must be used with LinearRoute.");
    }
    return linear(config, group, route, line, routeVariant, direction);
  } else {
    if (!(route instanceof HookRoute)) {
      throw new Error("HookContinuationGroup must be used with HookRoute.");
    }
    return hook(group, route, routeVariant, direction);
  }
}

function linear(
  config: HasSharedConfig,
  group: LinearContinuationGroup,
  route: LinearRoute,
  line: LineID,
  routeVariant: RouteVariantID,
  direction: DirectionID,
): ContinuationOption[] {
  const thisStopList = route.requireStopList(routeVariant, direction).stops;

  // Only services ending at the stop where services continue "from" are
  // relevant.
  if (thisStopList[thisStopList.length - 1] != group.from) {
    return [];
  }

  // Any stoplist from lines on the other side that start from the "from" stop
  // is an option.
  const otherLines = group.sideA.includes(line) ? group.sideB : group.sideA;
  return otherLines
    .map((o) => {
      const stopLists = requireLine(config, o).route.getStopLists();
      return stopLists
        .filter((l) => l.stops[0] == group.from)
        .map((l) => ({ line: o, route: l.variant, direction: l.direction }));
    })
    .flat();
}

function hook(
  group: HookContinuationGroup,
  route: HookRoute,
  routeVariant: RouteVariantID,
  direction: DirectionID,
): ContinuationOption[] {
  if (!(route instanceof HookRoute)) {
    throw new Error("HookContinuationGroup must be used with HookRoute.");
  }

  // Services going in a "down" direction do not have continuations.
  if (direction == route.reverse.id) {
    return [];
  }

  // Otherwise it could be any line in the group, but using the opposite route
  // to the original service.
  return group.lines.map((l) => ({
    line: l,
    route:
      routeVariant == HookRoute.directID
        ? HookRoute.hookedID
        : HookRoute.directID,
    direction: route.reverse.id,
  }));
}
