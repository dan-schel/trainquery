import { HookRoute } from "../../shared/system/routes/hook-route";
import { Route } from "../../shared/system/routes/line-route";
import { LinearRoute } from "../../shared/system/routes/linear-route";
import { YBranchRoute } from "../../shared/system/routes/y-branch-route";
import { LintContext, examplify } from "./utils";
import { getStop } from "../../shared/system/config-utils";

export function lintOrphanStops(ctx: LintContext) {
  const orphanStops = ctx.shared.stops
    .filter((s) => ctx.shared.lines.every((l) => !l.route.stopsAt(s.id)))
    .map((s) => s.name);

  ctx.logPluralizedWarning(
    orphanStops,
    (a) => `${a} is not served by any line.`,
    (a) => `${a} are not served by any lines.`,
    examplify(orphanStops, 3)
  );
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
    const line = pair.lineName;
    const stop = pair.stop.toFixed();
    ctx.logError(
      `The ${line} Line references the non-existent stop "${stop}".`
    );
  }
}

export function lintLineServiceTypes(ctx: LintContext) {
  const badLines = ctx.shared.lines
    .filter((l) => !ctx.shared.serviceTypes.includes(l.serviceType))
    .map((l) => l.name);

  ctx.logPluralizedError(
    badLines,
    (a) => `${a} refers to a service type which is not listed.`,
    (a) => `${a} refer to service types which are not listed.`,
    examplify(badLines, 3)
  );
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
