import { z } from "zod";
import {
  ServedStop,
  SkippedStop,
  StoppingPatternEntryJson,
  stoppingPatternEntryToJSON,
} from "./service-stop";
import { type StopID, StopIDJson } from "../ids";

export class CompleteStoppingPattern {
  constructor(readonly stops: (ServedStop | SkippedStop)[]) {}

  static readonly json = z
    .object({
      stops: StoppingPatternEntryJson.array(),
    })
    .transform((x) => new CompleteStoppingPattern(x.stops));

  toJSON(): z.input<typeof CompleteStoppingPattern.json> {
    return {
      stops: this.stops.map((s) => stoppingPatternEntryToJSON(s)),
    };
  }

  /** Return the list of stops between the origin and terminus only. */
  trim() {
    let origin: number | null = null;
    let terminus: number | null = null;
    for (let i = 0; i < this.stops.length; i++) {
      if (this.stops[i].express) {
        continue;
      }
      if (origin == null) {
        origin = i;
      }
      terminus = i;
    }
    if (origin == null || terminus == null) {
      throw new Error("Invalid stopping pattern. Cannot trim.");
    }
    return this.stops.slice(origin, terminus + 1);
  }
}

export class PartialStoppingPattern {
  constructor(
    /** The origin (which may be unknown). */
    readonly origin: {
      index: number;
      stop: StopID;
    } | null,
    /** The index of the terminus within the stop list for this variant/direction. */
    readonly terminus: {
      index: number;
      stop: StopID;
    }
  ) {}

  static readonly json = z
    .object({
      origin: z
        .object({
          index: z.number(),
          stop: StopIDJson,
        })
        .nullable(),
      terminus: z.object({
        index: z.number(),
        stop: StopIDJson,
      }),
    })
    .transform((x) => new PartialStoppingPattern(x.origin, x.terminus));

  toJSON(): z.input<typeof PartialStoppingPattern.json> {
    return {
      origin: this.origin,
      terminus: this.terminus,
    };
  }
}
