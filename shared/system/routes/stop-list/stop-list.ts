import { z } from "zod";
import {
  DirectionIDJson,
  LineIDJson,
  RouteVariantIDJson,
  type DirectionID,
  type LineID,
  type RouteVariantID,
} from "../../ids";
import { RouteStop } from "../route-stop";

export class StopListID {
  constructor(
    readonly line: LineID,
    readonly variant: RouteVariantID,
    readonly direction: DirectionID,
  ) {}

  static readonly json = z
    .object({
      line: LineIDJson,
      variant: RouteVariantIDJson,
      direction: DirectionIDJson,
    })
    .transform((x) => new StopListID(x.line, x.variant, x.direction));

  toJSON(): z.input<typeof StopListID.json> {
    return {
      line: this.line,
      variant: this.variant,
      direction: this.direction,
    };
  }
}

export class StopList {
  /**
   * The stops a service could actually stop at, i.e. the route stops with all
   * `express` and `via` stops removed.
   */
  readonly possibleStops = this.routeStops.filter(
    (x) => x.type === "stops" || x.type === "viaish",
  );

  constructor(
    /** The line, variant, and direction which uniquely identify this stop. */
    readonly id: StopListID,
    /** All stops on this route, including `express` and `via` stops. */
    readonly routeStops: RouteStop[],
  ) {}

  static readonly json = z
    .object({
      id: StopListID.json,
      stops: RouteStop.json.array(),
    })
    .transform((x) => new StopList(x.id, x.stops));

  toJSON(): z.input<typeof StopList.json> {
    return {
      id: this.id.toJSON(),
      stops: this.routeStops.map((x) => x.toJSON()),
    };
  }
}
