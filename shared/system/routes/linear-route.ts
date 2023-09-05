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
  DirectionID,
  RouteVariantID,
  toRouteVariantID,
  type StopID,
} from "../ids";

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
  static readonly jsonTransform = (x: z.infer<typeof LinearRoute.linearJson>) =>
    new LinearRoute(x.forward, x.reverse, x.stops);

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

  stopsAt(stop: StopID): boolean {
    return containsStop(stop, this.stops);
  }

  getStops(variant: RouteVariantID, direction: DirectionID): StopID[] {
    if (variant == LinearRoute.regularID) {
      const stops = nonViaStopIDs(this.stops);
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
