import { z } from "zod";
import { HookRoute } from "./hook-route";
import { Route } from "./line-route";
import { LinearRoute } from "./linear-route";
import { YBranchRoute } from "./y-branch-route";

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
  if (LinearRoute.detect(route)) {
    return route.toJSON();
  }
  else if (YBranchRoute.detect(route)) {
    return route.toJSON();
  }
  else if (HookRoute.detect(route)) {
    return route.toJSON();
  }
  throw new Error(`Unrecognized route type: "${route.type}"`);
}
