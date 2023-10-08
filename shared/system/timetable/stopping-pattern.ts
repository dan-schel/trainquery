import { z } from "zod";
import { ServedStop, SkippedStop } from "./service-stop";
import { type StopID, StopIDJson } from "../ids";

export class CompleteStoppingPattern {
  constructor(readonly stops: (ServedStop | SkippedStop)[]) {}

  static readonly json = z
    .object({
      stops: z.union([SkippedStop.json, ServedStop.json]).array(),
    })
    .transform((x) => new CompleteStoppingPattern(x.stops));

  toJSON(): z.input<typeof CompleteStoppingPattern.json> {
    return {
      stops: this.stops.map((s) => s.toJSON()),
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

// TODO: Making PartialStoppingPattern its own file and cleaning up the
// repetitiveness would be nice!

type PartialStoppingPatternStop = {
  index: number;
  stop: StopID;
  express: false;
  detail: ServedStop | null;
};
type PartialStoppingPatternSkip = {
  index: number;
  stop: StopID;
  express: true;
};

export class PartialStoppingPattern {
  constructor(
    /** The origin (which may be unknown). */
    readonly origin: PartialStoppingPatternStop | null,
    /**
     * Data about any additional non-origin/terminus stops or skips that we know
     * of. Should be provided in index order.
     */
    readonly additional: (
      | PartialStoppingPatternStop
      | PartialStoppingPatternSkip
    )[],
    /** The index of the terminus within the stop list for this variant/direction. */
    readonly terminus: PartialStoppingPatternStop
  ) {}

  static readonly json = z
    .object({
      origin: z
        .object({
          index: z.number(),
          stop: StopIDJson,
          detail: ServedStop.json.nullable(),
        })
        .nullable(),
      additional: z
        .union([
          z.object({
            index: z.number(),
            stop: StopIDJson,
            express: z.literal(false),
            detail: ServedStop.json.nullable(),
          }),
          z.object({
            index: z.number(),
            stop: StopIDJson,
            express: z.literal(true),
          }),
        ])
        .array(),
      terminus: z.object({
        index: z.number(),
        stop: StopIDJson,
        detail: ServedStop.json.nullable(),
      }),
    })
    .transform(
      (x) =>
        new PartialStoppingPattern(
          x.origin != null ? { ...x.origin, express: false } : null,
          x.additional,
          { ...x.terminus, express: false }
        )
    );

  toJSON(): z.input<typeof PartialStoppingPattern.json> {
    return {
      origin:
        this.origin != null
          ? {
              index: this.origin.index,
              stop: this.origin.stop,
              detail: this.origin.detail?.toJSON() ?? null,
            }
          : null,
      additional: this.additional.map((s) =>
        !s.express
          ? {
              index: s.index,
              stop: s.stop,
              express: false,
              detail: s.detail?.toJSON() ?? null,
            }
          : {
              index: s.index,
              stop: s.stop,
              express: true,
            }
      ),
      terminus: {
        index: this.terminus.index,
        stop: this.terminus.stop,
        detail: this.terminus.detail?.toJSON() ?? null,
      },
    };
  }

  /** The origin, terminus, and any additional stops (not skips) along the way. */
  getKnownStops() {
    const knownStops: PartialStoppingPatternStop[] = [];
    if (this.origin != null) {
      knownStops.push(this.origin);
    }
    knownStops.push(
      ...this.additional.filter(
        (x): x is PartialStoppingPatternStop => !x.express
      )
    );
    knownStops.push(this.terminus);
    return knownStops;
  }
}
