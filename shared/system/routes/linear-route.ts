import { z } from "zod";
import { DirectionDefinition, Route, createBothDirections } from "./line-route";
import { toRouteVariantID } from "../ids";
import { RouteStop } from "./route-stop";

/** The simplest type of line route. */
export class LinearRoute extends Route {
  static regularID = toRouteVariantID("regular");

  constructor(
    /** Direction details to use for stops in the provided order. */
    readonly forward: DirectionDefinition,
    /** Direction details to use for stops in the reverse order. */
    readonly reverse: DirectionDefinition,
    /** Array of stops this line stops at or travels via. */
    readonly stops: RouteStop[],
  ) {
    super(
      "linear",
      createBothDirections(
        LinearRoute.regularID,
        forward.id,
        reverse.id,
        stops,
      ),
    );
  }

  static readonly linearJson = z
    .object({
      type: z.literal("linear"),
      forward: DirectionDefinition.json,
      reverse: DirectionDefinition.json,
      stops: RouteStop.json.array(),
    })
    .transform((x) => new LinearRoute(x.forward, x.reverse, x.stops));

  toJSON(): z.input<typeof LinearRoute.linearJson> {
    return {
      type: "linear",
      forward: this.forward,
      reverse: this.reverse,
      stops: this.stops.map((s) => s.toJSON()),
    };
  }

  static detect(route: Route): route is LinearRoute {
    return route.type === "linear";
  }
}
