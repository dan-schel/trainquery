import { z } from "zod";
import { ServiceStop } from "./service-stop";

export class CompleteStoppingPattern {
  constructor(readonly stops: (ServiceStop | null)[]) { }

  static readonly json = z
    .object({
      stops: ServiceStop.json.nullable().array(),
    })
    .transform((x) => new CompleteStoppingPattern(x.stops));

  toJSON(): z.input<typeof CompleteStoppingPattern.json> {
    return {
      stops: this.stops.map((s) => s?.toJSON() ?? null),
    };
  }
}

export class PartialStoppingPattern {
  constructor(
    /** The index of the origin (which may be unknown). */
    readonly originIndex: number | null,
    /** The index of the terminus within the stop list for this variant/direction. */
    readonly terminusIndex: number,
  ) { }

  static readonly json = z
    .object({
      originIndex: z.number().nullable(),
      terminusIndex: z.number(),
    })
    .transform((x) => new PartialStoppingPattern(x.originIndex, x.terminusIndex));

  toJSON(): z.input<typeof PartialStoppingPattern.json> {
    return {
      originIndex: this.originIndex,
      terminusIndex: this.terminusIndex,
    };
  }
}
