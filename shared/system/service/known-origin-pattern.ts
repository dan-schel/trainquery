import { z } from "zod";
import { ServedStop } from "./served-stop";
import { type StopID, StopIDJson } from "../ids";

export class KnownOriginPattern {
  constructor(
    readonly origin: ServedStop,
    readonly terminus: {
      stop: StopID;
      stopListIndex: number;
    },
  ) {}

  static readonly json = z
    .object({
      type: z.literal("known-origin"),
      origin: ServedStop.json,
      terminus: z.object({
        stop: StopIDJson,
        stopListIndex: z.number(),
      }),
    })
    .transform((x) => new KnownOriginPattern(x.origin, x.terminus));

  toJSON(): z.input<typeof KnownOriginPattern.json> {
    return {
      type: "known-origin",
      origin: this.origin.toJSON(),
      terminus: this.terminus,
    };
  }
}
