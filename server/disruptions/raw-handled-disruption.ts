import { z } from "zod";
import { DisruptionSource, DisruptionSourceJson } from "./raw-disruption";

export class RawHandledDisruption {
  constructor(
    readonly source: DisruptionSource,
    readonly id: string,
    readonly hash: string,
    readonly infoMarkdown: string,
  ) {}

  static readonly json = z
    .object({
      source: DisruptionSourceJson,
      id: z.string(),
      hash: z.string(),
      infoMarkdown: z.string(),
    })
    .transform(
      (x) => new RawHandledDisruption(x.source, x.id, x.hash, x.infoMarkdown),
    );

  toJSON(): z.input<typeof RawHandledDisruption.json> {
    return {
      source: this.source,
      id: this.id,
      hash: this.hash,
      infoMarkdown: this.infoMarkdown,
    };
  }
}
