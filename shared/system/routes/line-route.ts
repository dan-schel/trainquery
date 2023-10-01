import { z } from "zod";
import { type LineRouteType } from "../enums";
import {
  type DirectionID,
  DirectionIDJson,
  type StopID,
  StopIDJson,
  type RouteVariantID,
} from "../ids";
import { unique } from "@schel-d/js-utils";
import { PusdoFilter } from "./pusdo";

export type StopList = {
  variant: RouteVariantID;
  direction: DirectionID;
  stops: StopID[];
  picksUp: PusdoFilter[];
  setsDown: PusdoFilter[];
};

/** Describes the stops and route a line takes. */
export abstract class Route {
  private _stopLists: StopList[] | null = null;

  constructor(
    /** E.g. 'linear', 'y-branch', etc. */
    readonly type: LineRouteType
  ) {}

  abstract getStopLists(): StopList[];

  stopsAt(stop: StopID): boolean {
    if (this._stopLists == null) {
      this._stopLists = this.getStopLists();
    }
    return this._stopLists.some((l) => l.stops.includes(stop));
  }

  getStopList(
    variant: RouteVariantID,
    direction: DirectionID
  ): StopList | null {
    if (this._stopLists == null) {
      this._stopLists = this.getStopLists();
    }
    return (
      this._stopLists.find(
        (l) => l.variant == variant && l.direction == direction
      ) ?? null
    );
  }

  getStops(variant: RouteVariantID, direction: DirectionID): StopID[] | null {
    return this.getStopList(variant, direction)?.stops ?? null;
  }

  requireStopList(variant: RouteVariantID, direction: DirectionID): StopList {
    const result = this.getStopList(variant, direction);
    if (result == null) {
      throw badVariantOrDirection(variant, direction);
    }
    return result;
  }

  requireStops(variant: RouteVariantID, direction: DirectionID): StopID[] {
    return this.requireStopList(variant, direction).stops;
  }

  getPossibleDirections(): DirectionID[] {
    if (this._stopLists == null) {
      this._stopLists = this.getStopLists();
    }
    return unique(
      this._stopLists.map((l) => l.direction),
      (a, b) => a == b
    );
  }

  picksUp(
    variant: RouteVariantID,
    direction: DirectionID,
    index: number
  ): boolean {
    return this.requireStopList(variant, direction).picksUp[index].matches(
      direction
    );
  }
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
export class RouteStop<T extends boolean = boolean> {
  constructor(
    /** Which stop occurs now on this route. */
    readonly stop: StopID,
    /** True if the route passes the stop without stopping. */
    readonly via: T,
    /** Can passengers alight at this station? */
    readonly setsDown: T extends false ? PusdoFilter : undefined,
    /** Can passengers board at this station? */
    readonly picksUp: T extends false ? PusdoFilter : undefined
  ) {}

  static readonly json = z
    .union([
      z.object({
        stops: StopIDJson,
        via: z.undefined(),
        setsDown: PusdoFilter.json.default(""),
        picksUp: PusdoFilter.json.default(""),
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
    if (this.via == false) {
      return {
        stops: this.stop,
        setsDown: (this as RouteStop<false>).setsDown.toJSON(),
        picksUp: (this as RouteStop<false>).picksUp.toJSON(),
      };
    }

    return {
      via: this.stop,
    };
  }
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
  return stops
    .filter((s): s is RouteStop<false> => !s.via)
    .map((s) => ({ stop: s.stop, setsDown: s.setsDown, picksUp: s.picksUp }));
}
