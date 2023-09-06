import { z } from "zod";
import { type LineRouteType } from "../enums";
import {
  type DirectionID,
  DirectionIDJson,
  type StopID,
  StopIDJson,
  type RouteVariantID,
} from "../ids";

/** Describes the stops and route a line takes. */
export abstract class Route {
  constructor(
    /** E.g. 'linear', 'y-branch', etc. */
    readonly type: LineRouteType
  ) {}

  abstract stopsAt(stop: StopID): boolean;

  abstract getStops(variant: RouteVariantID, direction: DirectionID): StopID[];
}

export class DirectionDefinition {
  constructor(
    /** Uniquely identify this direction from others on this line. */
    readonly id: DirectionID
  ) {}

  static readonly json = z
    .object({
      id: DirectionIDJson,
    })
    .transform((x) => new DirectionDefinition(x.id));

  toJSON(): z.input<typeof DirectionDefinition.json> {
    return {
      id: this.id,
    };
  }
}

/**
 * Describes stopping rules (e.g. express, set down only, etc.) for a particular
 * stop on a particular line.
 */
export class RouteStop {
  constructor(
    /** Which stop occurs now on this route. */
    readonly stop: StopID,
    /** True if the route passes the stop without stopping. */
    readonly via: boolean,
    /**
     * Can passengers alight at this station? Either true, false, or a direction
     * rule (e.g. 'direction-up').
     */
    readonly setDown?: boolean | string,
    /**
     * Can passengers board at this station? Either true, false, or a direction
     * rule (e.g. 'direction-up').
     */
    readonly pickUp?: boolean | string
  ) {}

  static readonly json = z
    .union([
      z.object({
        stops: StopIDJson,
        via: z.undefined(),
        setsDown: z.union([z.boolean(), z.string()]).default(true),
        picksUp: z.union([z.boolean(), z.string()]).default(true),
      }),
      z.object({
        stops: z.undefined(),
        via: StopIDJson,
        setsDown: z.undefined(),
        picksUp: z.undefined(),
      }),
    ])
    .transform(
      (x) =>
        new RouteStop(x.stops ?? x.via, x.via != null, x.setsDown, x.picksUp)
    );

  toJSON(): z.input<typeof RouteStop.json> {
    if (this.via) {
      return {
        via: this.stop,
      };
    }
    return {
      stops: this.stop,
      setsDown: this.setDown == true ? undefined : this.setDown,
      picksUp: this.pickUp == true ? undefined : this.pickUp,
    };
  }
}

/** True if one of the passed arrays contains this stop. */
export function containsStop(
  stop: StopID,
  ...stopArrays: RouteStop[][]
): boolean {
  return stopArrays.some((a) => a.some((s) => s.stop == stop && !s.via));
}

export function badVariantOrDirection(
  variant: RouteVariantID,
  direction: DirectionID
): Error {
  return new Error(
    `Route variant "${variant}" and direction "${direction}" is invalid for this line.`
  );
}

export function nonViaStopIDs(stops: RouteStop[]) {
  return stops.filter((s) => !s.via).map((s) => s.stop);
}
