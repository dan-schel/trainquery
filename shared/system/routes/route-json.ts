import { z } from "zod";
import { HookRoute } from "./hook-route";
import { Route } from "./line-route";
import { LinearRoute } from "./linear-route";
import { YBranchRoute } from "./y-branch-route";
import { fromRouteType } from "./line-routes";

export const RouteJson = z
  .discriminatedUnion("type", [
    LinearRoute.linearJson,
    YBranchRoute.yBranchJson,
    HookRoute.hookJson,
  ])
  .transform((x): Route => {
    return {
      linear: LinearRoute.jsonTransform,
      "y-branch": YBranchRoute.jsonTransform,
      hook: HookRoute.jsonTransform,
    }[x.type](x as any);
  });

export function routeToJson(route: Route): z.input<typeof RouteJson> {
  return fromRouteType<z.input<typeof RouteJson>>(route, {
    linear: (r) => r.toJSON(),
    "y-branch": (r) => r.toJSON(),
    hook: (r) => r.toJSON(),
  });
}
