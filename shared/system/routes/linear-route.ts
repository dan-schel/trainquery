import { z } from "zod";
import { DirectionDefinition, Route } from "./line-route";
import { toRouteVariantID } from "../ids";
import { StopList, StopListID } from "./stop-list/stop-list";
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
    return route.type === "linear";
  }

  protected defineStopLists(): StopList[] {
    return [
      new StopList(
        new StopListID(LinearRoute.regularID, this.forward.id),
        this.stops,
      ),
      new StopList(
        new StopListID(LinearRoute.regularID, this.reverse.id),
        [...this.stops].reverse(),
      ),
    ];
  }
}
