import { Route } from "../../shared/system/routes/line-route";
import { LintContext, examplify } from "./utils";
import { getStop } from "../../shared/system/config-utils";
import { fromRouteType } from "../../shared/system/routes/line-routes";

export function lintOrphanStops(ctx: LintContext) {
  const orphanStops = ctx.shared.stops
    .filter((s) => ctx.shared.lines.every((l) => !l.route.stopsAt(s.id)))
    .map((s) => s.name);

  ctx.logPluralizedWarning(
    orphanStops,
    (a) => `${a} is not served by any line.`,
    (a) => `${a} are not served by any lines.`,
    examplify(orphanStops, 3),
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
      `The ${line} Line references the non-existent stop "${stop}".`,
    );
  }
}

export function lintLineServiceTypes(ctx: LintContext) {
  const badLines = ctx.shared.lines
    .filter((l) => !ctx.shared.serviceTypes.some((s) => s.id == l.serviceType))
    .map((l) => l.name);

  ctx.logPluralizedError(
    badLines,
    (a) => `${a} refers to a service type which is not listed.`,
    (a) => `${a} refer to service types which are not listed.`,
    examplify(badLines, 3),
  );
}

function stopsOnRoute(route: Route) {
  return fromRouteType(route, {
    linear: (r) => r.stops,
    "y-branch": (r) => [
      ...r.firstBranch.stops,
      ...r.secondBranch.stops,
      ...r.shared,
    ],
    hook: (r) => [...r.stops, ...r.direct, ...r.hooked],
  });
}
