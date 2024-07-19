import { z } from "zod";
import { type LineRouteType } from "../enums";
import {
  type DirectionID,
  DirectionIDJson,
  type StopID,
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

export function badVariantOrDirection(
  variant: RouteVariantID,
  direction: DirectionID,
): Error {
  return new Error(
    `Route variant "${variant}" and direction "${direction}" is invalid for this line.`,
  );
}
