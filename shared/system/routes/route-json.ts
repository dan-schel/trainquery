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
      linear: LinearRoute.transform,
      "y-branch": YBranchRoute.transform,
      hook: HookRoute.transform,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }[x.type](x as any);
  });

export function routeToJSON(route: Route): z.input<typeof RouteJson> {
  return fromRouteType<z.input<typeof RouteJson>>(route, {
    linear: (r) => r.toJSON(),
    "y-branch": (r) => r.toJSON(),
    hook: (r) => r.toJSON(),
  });
}
