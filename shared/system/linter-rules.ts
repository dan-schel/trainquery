import { z } from "zod";

export class LinterRules {
  constructor(readonly stopNameRegex: RegExp, readonly lineNameRegex: RegExp) {}

  static readonly json = z
    .object({
      stopNameRegex: z.string().transform((x) => new RegExp(x)),
      lineNameRegex: z.string().transform((x) => new RegExp(x)),
    })
    .transform((x) => new LinterRules(x.stopNameRegex, x.lineNameRegex));

  toJSON(): z.input<typeof LinterRules.json> {
    return {
      stopNameRegex: this.stopNameRegex.source,
      lineNameRegex: this.lineNameRegex.source,
    };
  }
}
