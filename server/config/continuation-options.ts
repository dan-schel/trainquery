import {
  HasSharedConfig,
  getContinuationGroupForLine,
  requireLine,
} from "../../shared/system/config-utils";
import {
  HookContinuationGroup,
  LinearContinuationGroup,
} from "../../shared/system/continuation-group";
import { HookRoute } from "../../shared/system/routes/hook-route";
import { LinearRoute } from "../../shared/system/routes/linear-route";
import { FullStopListID } from "../../shared/system/routes/stop-list/stop-list";

export function getContinuationOptions(
  config: HasSharedConfig,
  stoplist: FullStopListID,
): FullStopListID[] {
  const group = getContinuationGroupForLine(config, stoplist.line);
  if (group == null) {
    return [];
  }

  const route = requireLine(config, stoplist.line).route;

  if (group instanceof LinearContinuationGroup) {
    if (!(route instanceof LinearRoute)) {
      throw new Error("LinearContinuationGroup must be used with LinearRoute.");
    }
    return linear(config, stoplist, group, route);
  } else {
    if (!(route instanceof HookRoute)) {
      throw new Error("HookContinuationGroup must be used with HookRoute.");
    }
    return hook(stoplist, group, route);
  }
}

function linear(
  config: HasSharedConfig,
  stoplist: FullStopListID,
  group: LinearContinuationGroup,
  route: LinearRoute,
): FullStopListID[] {
  const thisStopList = route.requireStopList(stoplist).possibleStops;

  // Only services ending at the stop where services continue "from" are
  // relevant.
  if (thisStopList[thisStopList.length - 1].stop !== group.from) {
    return [];
  }

  // Any stoplist from lines on the other side that start from the "from" stop
  // is an option.
  const otherLines = group.sideA.includes(stoplist.line)
    ? group.sideB
    : group.sideA;

  return otherLines
    .map((line) => {
      const stopLists = requireLine(config, line).route.stopLists;
      return stopLists
        .filter((l) => l.possibleStops[0].stop === group.from)
        .map((l) => l.id.toFullStopListID(line));
    })
    .flat();
}

function hook(
  stoplist: FullStopListID,
  group: HookContinuationGroup,
  route: HookRoute,
): FullStopListID[] {
  if (!(route instanceof HookRoute)) {
    throw new Error("HookContinuationGroup must be used with HookRoute.");
  }

  // Services going in a "down" direction do not have continuations.
  if (stoplist.direction === route.reverse.id) {
    return [];
  }

  // Otherwise it could be any line in the group, but using the opposite route
  // to the original service.
  const downRoute =
    stoplist.variant === HookRoute.directID
      ? HookRoute.hookedID
      : HookRoute.directID;
  return group.lines.map(
    (l) => new FullStopListID(l, downRoute, route.reverse.id),
  );
}
