import { z } from "zod";
import {
  DirectionDefinition,
  Route,
  RouteStop,
  type StopList,
  nonViaStopIDs,
} from "./line-route";
import { toRouteVariantID } from "../ids";

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

  getStopLists(): StopList[] {
    const hooked = nonViaStopIDs([...this.stops, ...this.hooked]);
    const direct = nonViaStopIDs([...this.stops, ...this.direct]);
    const hookedReversed = [...hooked].reverse();
    const directReversed = [...direct].reverse();

    return [
      {
        variant: HookRoute.hookedID,
        direction: this.forward.id,
        stops: hooked.map((h) => h.stop),
        picksUp: hooked.map((h) => h.picksUp),
        setsDown: hooked.map((h) => h.setsDown),
      },
      {
        variant: HookRoute.hookedID,
        direction: this.reverse.id,
        stops: hookedReversed.map((h) => h.stop),
        picksUp: hookedReversed.map((h) => h.picksUp),
        setsDown: hookedReversed.map((h) => h.setsDown),
      },
      {
        variant: HookRoute.directID,
        direction: this.forward.id,
        stops: direct.map((h) => h.stop),
        picksUp: direct.map((h) => h.picksUp),
        setsDown: direct.map((h) => h.setsDown),
      },
      {
        variant: HookRoute.directID,
        direction: this.reverse.id,
        stops: directReversed.map((h) => h.stop),
        picksUp: directReversed.map((h) => h.picksUp),
        setsDown: directReversed.map((h) => h.setsDown),
      },
    ];
  }
}
