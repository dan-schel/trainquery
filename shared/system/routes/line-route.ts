import { z } from "zod";
import { type LineRouteType } from "../enums";
import { type DirectionID, DirectionIDJson, type StopID, StopIDJson } from "../ids";

/** Describes the stops and route a line takes. */
export abstract class Route {
  constructor(
    /** E.g. 'linear', 'y-branch', etc. */
    readonly type: LineRouteType
  ) {
    this.type = type;
  }
}

export class DirectionDefinition {
  constructor(
    /** Uniquely identify this direction from others on this line. */
    readonly id: DirectionID
  ) {
    this.id = id;
  }

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
  ) {
    this.stop = stop;
    this.via = via;
    this.setDown = setDown;
    this.pickUp = pickUp;
  }

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
