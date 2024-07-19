import { z } from "zod";
import { type LineRouteType } from "../enums";
import {
  type DirectionID,
  DirectionIDJson,
  type StopID,
  StopIDJson,
  type RouteVariantID,
} from "../ids";
import { unique } from "@dan-schel/js-utils";
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
    readonly type: LineRouteType,
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
    direction: DirectionID,
  ): StopList | null {
    if (this._stopLists == null) {
      this._stopLists = this.getStopLists();
    }
    return (
      this._stopLists.find(
        (l) => l.variant === variant && l.direction === direction,
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
      (a, b) => a === b,
    );
  }

  picksUp(
    variant: RouteVariantID,
    direction: DirectionID,
    index: number,
  ): boolean {
    return this.requireStopList(variant, direction).picksUp[index].matches(
      direction,
    );
  }
  setsDown(
    variant: RouteVariantID,
    direction: DirectionID,
    index: number,
  ): boolean {
    return this.requireStopList(variant, direction).setsDown[index].matches(
      direction,
    );
  }
}

export class DirectionDefinition {
  constructor(
    /** Uniquely identify this direction from others on this line. */
    readonly id: DirectionID,
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

/** All route stop types. */
export const RouteStopTypes = [
  // Considered a stop on the line. Not all trains necessarily stop here, but
  // "stopping all stations" trains would.
  "stops",
  // Still considered "a stop on the line", but line diagrams show this stop
  // greyed out, acknowledging that it's always skipped.
  "express",
  // A stop that isn't considered to be "on this line" at all, i.e. a service
  // can skip this stop and still be considered "stopping all stations", e.g.
  // suburban stations on V/Line trains. Only shown on the line page as skipped.
  "via",
  // Like "via", but suddenly is considered to be "on this line" for a service
  // that provides a stopping time, e.g. East Pakenham on the Gippsland line.
  "viaish",
] as const;
/** E.g. 'stops', 'via', 'express', etc. */
export type RouteStopType = (typeof RouteStopTypes)[number];
/** Matches a value in {@link RouteStopTypes}. */
export const RouteStopTypeJson = z.enum(RouteStopTypes);

/**
 * Describes stopping rules (e.g. express, set down only, etc.) for a particular
 * stop on a particular line.
 */
export class RouteStop<T extends RouteStopType = RouteStopType> {
  constructor(
    /** Which stop occurs now on this route. */
    readonly stop: StopID,
    /** True if the route passes the stop without stopping. */
    readonly type: T,
    /** Can passengers alight at this station? */
    readonly setsDown: T extends "stops" | "viaish" ? PusdoFilter : undefined,
    /** Can passengers board at this station? */
    readonly picksUp: T extends "stops" | "viaish" ? PusdoFilter : undefined,
  ) {}

  static readonly json = z
    .union([
      z.object({
        stops: StopIDJson,
        express: z.undefined(),
        via: z.undefined(),
        viaish: z.undefined(),
        setsDown: PusdoFilter.json.default(""),
        picksUp: PusdoFilter.json.default(""),
      }),
      z.object({
        stops: z.undefined(),
        express: StopIDJson,
        via: z.undefined(),
        viaish: z.undefined(),
        setsDown: z.undefined(),
        picksUp: z.undefined(),
      }),
      z.object({
        stops: z.undefined(),
        express: z.undefined(),
        via: StopIDJson,
        viaish: z.undefined(),
        setsDown: z.undefined(),
        picksUp: z.undefined(),
      }),
      z.object({
        stops: z.undefined(),
        express: z.undefined(),
        via: z.undefined(),
        viaish: StopIDJson,
        setsDown: PusdoFilter.json.default(""),
        picksUp: PusdoFilter.json.default(""),
      }),
    ])
    .transform((x) => {
      if (x.stops != null) {
        return new RouteStop(x.stops, "stops", x.setsDown, x.picksUp);
      } else if (x.express != null) {
        return new RouteStop(x.express, "express", undefined, undefined);
      } else if (x.via != null) {
        return new RouteStop(x.via, "via", undefined, undefined);
      } else {
        return new RouteStop(x.viaish, "viaish", x.setsDown, x.picksUp);
      }
    });

  toJSON(): z.input<typeof RouteStop.json> {
    const pusdoFilters = {
      setsDown: this.setsDown?.toJSON(),
      picksUp: this.picksUp?.toJSON(),
    };

    if (this.type === "stops") {
      return {
        stops: this.stop,
        ...pusdoFilters,
      };
    } else if (this.type === "express") {
      return {
        express: this.stop,
      };
    } else if (this.type === "via") {
      return {
        via: this.stop,
      };
    } else {
      return {
        viaish: this.stop,
        ...pusdoFilters,
      };
    }
  }
}

export function badVariantOrDirection(
  variant: RouteVariantID,
  direction: DirectionID,
): Error {
  return new Error(
    `Route variant "${variant}" and direction "${direction}" is invalid for this line.`,
  );
}

export function nonViaStopIDs(stops: RouteStop[]) {
  return stops
    .filter((s): s is RouteStop<false> => !s.via)
    .map((s) => ({ stop: s.stop, setsDown: s.setsDown, picksUp: s.picksUp }));
}
