import { z } from "zod";
import { ServedStop } from "./served-stop";
import { SkippedStop } from "./skipped-stop";

export class CompletePattern {
  readonly origin: ServedStop;
  readonly terminus: ServedStop;

  constructor(readonly stops: (ServedStop | SkippedStop)[]) {
    let origin: ServedStop | null = null;
    let terminus: ServedStop | null = null;
    for (let i = 0; i < this.stops.length; i++) {
      const stop = this.stops[i];
      if (stop.express) {
        continue;
      }
      if (origin == null) {
        origin = stop;
      }
      terminus = stop;
    }
    if (origin == null || terminus == null) {
      throw new Error("Invalid stopping pattern.");
    }
    this.origin = origin;
    this.terminus = terminus;
  }

  static readonly json = z
    .object({
      type: z.literal("complete"),
      stops: z.union([SkippedStop.json, ServedStop.json]).array(),
    })
    .transform((x) => new CompletePattern(x.stops));

  toJSON(): z.input<typeof CompletePattern.json> {
    return {
      type: "complete",
      stops: this.stops.map((s) => s.toJSON()),
    };
  }

  requireServedStop(stopListIndex: number) {
    const stop = this.stops.find((s) => s.stopListIndex === stopListIndex);
    if (stop == null || stop.express) {
      throw new Error("Stop missing or is express.");
    }
    return stop;
  }

  getStop(stopListIndex: number): ServedStop | SkippedStop | null {
    return this.stops.find((s) => s.stopListIndex === stopListIndex) ?? null;
  }

  with({ stops }: { stops?: (ServedStop | SkippedStop)[] }): CompletePattern {
    return new CompletePattern(stops ?? this.stops);
  }
}
