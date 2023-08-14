import { z } from "zod";
import { type LineColor, LineColorJson } from "./enums";
import {
  type LineID,
  LineIDJson,
  type ServiceTypeID,
  ServiceTypeIDJson,
  toServiceTypeID,
} from "./ids";
import { Route } from "./routes/line-route";
import { RouteJson, routeToJson } from "./routes/route-json";

/** Describes the name, route, etc. of a particular transit line. */
export class Line {
  constructor(
    /** Uniquely identifies this line from others in the transit system. */
    readonly id: LineID,
    /** E.g. 'Pakenham'. */
    readonly name: string,
    /** Color used on the frontend, e.g. 'green'. */
    readonly color: LineColor,
    /** True if the line only runs occasionally. */
    readonly specialEventsOnly: boolean,
    /** Type of service on this line, e.g. 'suburban' or 'regional'. */
    readonly serviceType: ServiceTypeID,
    /** Describes the stops and route this line takes. */
    readonly route: Route
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.specialEventsOnly = specialEventsOnly;
    this.serviceType = serviceType;
    this.route = route;
  }

  static readonly json = z
    .object({
      id: LineIDJson,
      name: z.string(),
      color: LineColorJson.default("none"),
      specialEventsOnly: z.boolean().default(false),
      serviceType: ServiceTypeIDJson.default(toServiceTypeID("normal")),
      route: RouteJson,
    })
    .transform(
      (x) =>
        new Line(
          x.id,
          x.name,
          x.color,
          x.specialEventsOnly,
          x.serviceType,
          x.route
        )
    );

  toJSON(): z.input<typeof Line.json> {
    return {
      id: this.id,
      name: this.name,
      color: this.color == "none" ? undefined : this.color,
      specialEventsOnly: this.specialEventsOnly ? true : undefined,
      serviceType: this.serviceType == "normal" ? undefined : this.serviceType,
      route: routeToJson(this.route),
    };
  }
}
