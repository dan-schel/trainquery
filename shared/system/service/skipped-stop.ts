import { z } from "zod";
import { type StopID, StopIDJson } from "../ids";

export class SkippedStop {
  readonly express = true;

  constructor(readonly stop: StopID, readonly stopListIndex: number) {}

  static readonly json = z
    .object({
      stop: StopIDJson,
      stopListIndex: z.number(),

      // Ensures this is never confused for a served stop.
      express: z.literal(true),
    })
    .transform((x) => new SkippedStop(x.stop, x.stopListIndex));

  toJSON(): z.input<typeof SkippedStop.json> {
    return {
      stop: this.stop,
      stopListIndex: this.stopListIndex,
      express: this.express,
    };
  }
}
