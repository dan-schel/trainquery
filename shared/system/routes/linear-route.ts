import { z } from "zod";
import {
  DirectionDefinition,
  Route,
  RouteStop,
  type StopList,
  nonViaStopIDs,
} from "./line-route";
import { toRouteVariantID } from "../ids";

/** The simplest type of line route. */
export class LinearRoute extends Route {
  static regularID = toRouteVariantID("regular");

  constructor(
    /** Direction details to use for stops in the provided order. */
    readonly forward: DirectionDefinition,
    /** Direction details to use for stops in the reverse order. */
    readonly reverse: DirectionDefinition,
    /** Array of stops this line stops at or travels via. */
    readonly stops: RouteStop[]
  ) {
    super("linear");
  }

  static readonly linearJson = z.object({
    type: z.literal("linear"),
    forward: DirectionDefinition.json,
    reverse: DirectionDefinition.json,
    stops: RouteStop.json.array(),
  });

  static transform(x: z.infer<typeof LinearRoute.linearJson>) {
    return new LinearRoute(x.forward, x.reverse, x.stops);
  }

  toJSON(): z.input<typeof LinearRoute.linearJson> {
    return {
      type: "linear",
      forward: this.forward,
      reverse: this.reverse,
      stops: this.stops.map((s) => s.toJSON()),
    };
  }

  static detect(route: Route): route is LinearRoute {
    return route.type == "linear";
  }

  getStopLists(): StopList[] {
    const stops = nonViaStopIDs(this.stops);
    const stopsReversed = [...stops].reverse();

    return [
      {
        variant: LinearRoute.regularID,
        direction: this.forward.id,
        stops: stops.map((h) => h.stop),
        picksUp: stops.map((h) => h.picksUp),
        setsDown: stops.map((h) => h.setsDown),
      },
      {
        variant: LinearRoute.regularID,
        direction: this.reverse.id,
        stops: stopsReversed.map((h) => h.stop),
        picksUp: stopsReversed.map((h) => h.picksUp),
        setsDown: stopsReversed.map((h) => h.setsDown),
      },
    ];
  }
}
