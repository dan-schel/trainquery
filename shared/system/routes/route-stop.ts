import { z } from "zod";
import { type StopID, StopIDJson } from "../ids";
import { PusdoFilter } from "./pusdo";

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
