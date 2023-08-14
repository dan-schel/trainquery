import { HookRoute } from "../../shared/system/routes/hook-route";
import { Route } from "../../shared/system/routes/line-route";
import { LinearRoute } from "../../shared/system/routes/linear-route";
import { YBranchRoute } from "../../shared/system/routes/y-branch-route";
import { LintContext, examples } from "./utils";
import { getStop } from "../../shared/system/config-utils";

export function lintOrphanStops(ctx: LintContext) {
  const orphanStops = ctx.shared.stops.filter((s) =>
    ctx.shared.lines.every((l) => !l.route.stopsAt(s.id))
  );
  if (orphanStops.length > 0) {
    ctx.warn(
      `${examples(
        orphanStops.map((s) => s.name),
        3
      )} ${
        orphanStops.length == 1
          ? "is not served by any line"
          : "are not served by any lines"
      }.`
    );
  }
}

export function lintMissingLineStops(ctx: LintContext) {
  const pairs = [];
  for (const line of ctx.shared.lines) {
    const stops = stopsOnRoute(line.route);

    for (const stop of stops) {
      if (getStop(ctx, stop.stop) == null) {
        pairs.push({ lineName: line.name, stop: stop.stop });
      }
    }
  }

  for (const pair of pairs) {
    ctx.throw(
      `The ${
        pair.lineName
      } line references stop "${pair.stop.toFixed()}", which doesn't exist.`
    );
  }
}

function stopsOnRoute(route: Route) {
  if (route instanceof LinearRoute) {
    return route.stops;
  } else if (route instanceof YBranchRoute) {
    return [
      ...route.firstBranch.stops,
      ...route.secondBranch.stops,
      ...route.shared,
    ];
  } else if (route instanceof HookRoute) {
    return [...route.stops, ...route.direct, ...route.hooked];
  } else {
    throw new Error(`Unrecognised line route type "${route.type}".`);
  }
}
