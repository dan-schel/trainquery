import { z } from "zod";
import { StopIDJson, type StopID } from "./ids";

export class ViaRule {
  constructor(
    readonly text: string,
    readonly stops: StopID[],
    readonly onlyIfContinuing: boolean
  ) {}

  static readonly json = z
    .object({
      text: z.string(),
      stops: StopIDJson.array(),
      onlyIfContinuing: z.boolean().default(false),
    })
    .transform((x) => new ViaRule(x.text, x.stops, x.onlyIfContinuing));

  toJSON(): z.input<typeof ViaRule.json> {
    return {
      text: this.text,
      stops: this.stops,
      onlyIfContinuing: this.onlyIfContinuing ? true : undefined,
    };
  }
}
