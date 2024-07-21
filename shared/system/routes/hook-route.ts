import { z } from "zod";
import { DirectionDefinition, Route } from "./line-route";
import { toRouteVariantID } from "../ids";
import { StopList, StopListID } from "./stop-list/stop-list";
import { RouteStop } from "./route-stop";

/** Route with a balloon loop section where services terminate inside the loop. */
export class HookRoute extends Route {
  static hookedID = toRouteVariantID("hooked");
  static directID = toRouteVariantID("direct");

  constructor(
    /** Direction details to use for stops in the provided order. */
    readonly forward: DirectionDefinition,
    /** Direction details to use for stops in the reverse order. */
    readonly reverse: DirectionDefinition,
    /**
     * Stops, ordered from 'hook handle' end to the last stop before hooked
     * section.
     */
    readonly stops: RouteStop[],
    /**
     * Stops that make up the hooked section, ordered from start of hook to
     * terminus.
     */
    readonly hooked: RouteStop[],
    /**
     * Stops that travel directly to the terminus (avoiding the hooked section),
     * ordered with the terminus last.
     */
    readonly direct: RouteStop[],
  ) {
    super("hook");
  }

  static readonly hookJson = z.object({
    type: z.literal("hook"),
    forward: DirectionDefinition.json,
    reverse: DirectionDefinition.json,
    stops: RouteStop.json.array(),
    hooked: RouteStop.json.array(),
    direct: RouteStop.json.array(),
  });

  static transform(x: z.infer<typeof HookRoute.hookJson>) {
    return new HookRoute(x.forward, x.reverse, x.stops, x.hooked, x.direct);
  }

  toJSON(): z.input<typeof HookRoute.hookJson> {
    return {
      type: "hook",
      forward: this.forward,
      reverse: this.reverse,
      stops: this.stops.map((s) => s.toJSON()),
      hooked: this.hooked.map((s) => s.toJSON()),
      direct: this.direct.map((s) => s.toJSON()),
    };
  }

  static detect(route: Route): route is HookRoute {
    return route.type === "hook";
  }

  protected defineStopLists(): StopList[] {
    const hooked = [...this.stops, ...this.hooked];
    const direct = [...this.stops, ...this.direct];
    const hookedReversed = [...hooked].reverse();
    const directReversed = [...direct].reverse();

    return [
      new StopList(new StopListID(HookRoute.hookedID, this.forward.id), hooked),
      new StopList(new StopListID(HookRoute.directID, this.forward.id), direct),
      new StopList(
        new StopListID(HookRoute.hookedID, this.reverse.id),
        hookedReversed,
      ),
      new StopList(
        new StopListID(HookRoute.directID, this.reverse.id),
        directReversed,
      ),
    ];
  }
}
