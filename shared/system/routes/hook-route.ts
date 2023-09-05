import { z } from "zod";
import {
  DirectionDefinition,
  Route,
  RouteStop,
  badVariantOrDirection,
  containsStop,
  nonViaStopIDs,
} from "./line-route";
import {
  toRouteVariantID,
  type StopID,
  RouteVariantID,
  DirectionID,
} from "../ids";

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
    readonly direct: RouteStop[]
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
  static readonly jsonTransform = (x: z.infer<typeof HookRoute.hookJson>) =>
    new HookRoute(x.forward, x.reverse, x.stops, x.hooked, x.direct);

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
    return route.type == "hook";
  }

  stopsAt(stop: StopID): boolean {
    return containsStop(stop, this.stops, this.hooked, this.direct);
  }

  getStops(variant: RouteVariantID, direction: DirectionID): StopID[] {
    if (variant == HookRoute.hookedID) {
      const stops = nonViaStopIDs([...this.stops, ...this.hooked]);
      if (direction == this.forward.id) {
        return stops;
      }
      if (direction == this.reverse.id) {
        return stops.reverse();
      }
    }
    if (variant == HookRoute.directID) {
      const stops = nonViaStopIDs([...this.stops, ...this.direct]);
      if (direction == this.forward.id) {
        return stops;
      }
      if (direction == this.reverse.id) {
        return stops.reverse();
      }
    }
    throw badVariantOrDirection(variant, direction);
  }
}
