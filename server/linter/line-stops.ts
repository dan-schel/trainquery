import { ServerConfig } from "../../shared/system/config";
import { HookRoute } from "../../shared/system/routes/hook-route";
import { Route } from "../../shared/system/routes/line-route";
import { LinearRoute } from "../../shared/system/routes/linear-route";
import { YBranchRoute } from "../../shared/system/routes/y-branch-route";
import { LintMessage, examples } from "./utils";
import { getStop } from "../../shared/system/config-utils";

export function lintOrphanStops(data: ServerConfig, messages: LintMessage[]) {
  const orphanStops = data.shared.stops.filter(s => data.shared.lines.every(l => !l.route.stopsAt(s.id)));
  if (orphanStops.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(orphanStops.map((s) => s.name), 3)} ${orphanStops.length == 1 ? "is not served by any line" : "are not served by any lines"}.`,
    });
  }
}

export function lintMissingLineStops(data: ServerConfig, messages: LintMessage[]) {
  const pairs = [];
  for (const line of data.shared.lines) {
    const stops = stopsOnRoute(line.route);

    for (const stop of stops) {
      if (getStop(data, stop.stop) == null) {
        pairs.push({ lineName: line.name, stop: stop.stop });
      }
    }
  }

  for (const pair of pairs) {
    messages.push({
      severity: "error",
      message: `The ${pair.lineName} line references stop "${pair.stop.toFixed()}", which doesn't exist.`
    });
  }
}

function stopsOnRoute(route: Route) {
  if (route instanceof LinearRoute) {
    return route.stops;
  }
  else if (route instanceof YBranchRoute) {
    return [...route.firstBranch.stops, ...route.secondBranch.stops, ...route.shared];
  }
  else if (route instanceof HookRoute) {
    return [...route.stops, ...route.direct, ...route.hooked];
  }
  else {
    throw new Error(`Unrecognised line route type "${route.type}".`);
  }
}
