import { z } from "zod";
import { HookRoute } from "./hook-route";
import { Route } from "./line-route";
import { LinearRoute } from "./linear-route";
import { YBranchRoute } from "./y-branch-route";
import { fromRouteType } from "./line-routes";

export const RouteJson = z.union([
  LinearRoute.linearJson,
  YBranchRoute.yBranchJson,
  HookRoute.hookJson,
]);

export function routeToJSON(route: Route): z.input<typeof RouteJson> {
  return fromRouteType<z.input<typeof RouteJson>>(route, {
    linear: (r) => r.toJSON(),
    "y-branch": (r) => r.toJSON(),
    hook: (r) => r.toJSON(),
  });
}
