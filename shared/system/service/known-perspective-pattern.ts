import { z } from "zod";
import { type StopID, StopIDJson } from "../ids";
import { ServedStop } from "./served-stop";

export class KnownPerspectivePattern {
  constructor(
    readonly perspective: ServedStop,
    readonly terminus: {
      stop: StopID;
      stopListIndex: number;
    }
  ) {}

  static readonly json = z
    .object({
      type: z.literal("known-origin"),
      perspective: ServedStop.json,
      terminus: z.object({
        stop: StopIDJson,
        stopListIndex: z.number(),
      }),
    })
    .transform((x) => new KnownPerspectivePattern(x.perspective, x.terminus));

  toJSON(): z.input<typeof KnownPerspectivePattern.json> {
    return {
      type: "known-origin",
      perspective: this.perspective.toJSON(),
      terminus: this.terminus,
    };
  }
}
