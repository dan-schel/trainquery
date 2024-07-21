import { z } from "zod";
import {
  DirectionIDJson,
  LineID,
  LineIDJson,
  RouteVariantIDJson,
  type DirectionID,
  type RouteVariantID,
} from "../../ids";
import { RouteStop } from "../route-stop";

/** Uniquely identifies a stop list from others in the same line. */
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

  equals(other: StopListID | FullStopListID): boolean {
    return this.variant === other.variant && this.direction === other.direction;
  }

  toFullStopListID(line: LineID): FullStopListID {
    return new FullStopListID(line, this.variant, this.direction);
  }
}

/** Uniquely identifies a stop list, and includes the line ID. */
export class FullStopListID {
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
    .transform((x) => new FullStopListID(x.line, x.variant, x.direction));

  toJSON(): z.input<typeof FullStopListID.json> {
    return {
      line: this.line,
      variant: this.variant,
      direction: this.direction,
    };
  }

  equals(other: FullStopListID): boolean {
    return (
      this.line === other.line &&
      this.variant === other.variant &&
      this.direction === other.direction
    );
  }

  toStopListID(): StopListID {
    return new StopListID(this.variant, this.direction);
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
