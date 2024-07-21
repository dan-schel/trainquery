import { z } from "zod";
import {
  DirectionIDJson,
  RouteVariantIDJson,
  type DirectionID,
  type RouteVariantID,
} from "../../ids";
import { RouteStop } from "../route-stop";

export class StopListID {
  constructor(
    readonly variant: RouteVariantID,
    readonly direction: DirectionID,
  ) {}

  static readonly json = z
    .object({
      variant: RouteVariantIDJson,
      direction: DirectionIDJson,
    })
    .transform((x) => new StopListID(x.variant, x.direction));

  toJSON(): z.input<typeof StopListID.json> {
    return {
      variant: this.variant,
      direction: this.direction,
    };
  }

  equals(other: StopListID): boolean {
    return this.variant === other.variant && this.direction === other.direction;
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
  /**
   * The stops that are considered "on this line", i.e. the route stops with all
   * `via` and `viaish` stops removed.
   */
  readonly canonicalStops = this.routeStops.filter(
    (x) => x.type === "stops" || x.type === "express",
  );

  constructor(
    /**
     * The variant and direction which uniquely identify this stop list from
     * others in the same line.
     */
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
