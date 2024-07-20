import { z } from "zod";
import { type StopID, StopIDJson } from "../ids";
import { PusdoFilter } from "./pusdo";

/*
 * ROUTE STOP TYPE EXPLANATION:
 *
 * |-----------------------------|----------------|--------------------|
 * |                             | "On this line" | Not "on this line" |
 * |-----------------------------|----------------|--------------------|
 * | Trains sometimes stop here  | stops          | viaish             |
 * |-----------------------------|----------------|--------------------|
 * | Trains never EVER stop here | express        | via                |
 * |-----------------------------|----------------|--------------------|
 *
 * Examples:
 * - "stops": Berwick on the Gippsland line.
 * - "viaish": East Pakenham on the Gippsland line.
 * - "express": South Kensington on the Sunbury line.
 * - "via": Cardinia Road on the Gippsland line.
 *
 * Recording "via" stops seems redundant, but it's done so we can show them on
 * the line diagram on the line page (and also might be required for the train
 * map in the future).
 */

/** All route stop types. */
export const RouteStopTypes = ["stops", "express", "via", "viaish"] as const;
/** E.g. 'stops', 'via', 'express', etc. */
export type RouteStopType = (typeof RouteStopTypes)[number];
/** Matches a value in {@link RouteStopTypes}. */
export const RouteStopTypeJson = z.enum(RouteStopTypes);

/**
 * Describes stopping rules (e.g. express, set down only, etc.) for a particular
 * stop on a particular line.
 */
export class RouteStop {
  constructor(
    /** Which stop occurs now on this route. */
    readonly stop: StopID,
    /** True if the route passes the stop without stopping. */
    readonly type: RouteStopType,
    /** Can passengers alight at this station? */
    readonly setsDown: PusdoFilter | null,
    /** Can passengers board at this station? */
    readonly picksUp: PusdoFilter | null,
  ) {}

  static readonly json = z
    .union([
      z.object({
        stops: StopIDJson,
        setsDown: PusdoFilter.json.default(""),
        picksUp: PusdoFilter.json.default(""),
      }),
      z.object({
        express: StopIDJson,
      }),
      z.object({
        via: StopIDJson,
      }),
      z.object({
        viaish: StopIDJson,
        setsDown: PusdoFilter.json.default(""),
        picksUp: PusdoFilter.json.default(""),
      }),
    ])
    .transform((x) => {
      if ("stops" in x) {
        return new RouteStop(x.stops, "stops", x.setsDown, x.picksUp);
      } else if ("express" in x) {
        return new RouteStop(x.express, "express", null, null);
      } else if ("via" in x) {
        return new RouteStop(x.via, "via", null, null);
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
