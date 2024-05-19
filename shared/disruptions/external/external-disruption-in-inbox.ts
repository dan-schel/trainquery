import { z } from "zod";
import { Disruption } from "../processed/disruption";
import { ExternalDisruption } from "./external-disruption";

export class ExternalDisruptionInInbox {
  constructor(
    readonly disruption: ExternalDisruption,

    // Or might this also include "generated" disruptions?
    readonly provisionalDisruptions: Disruption[],
  ) {}

  static readonly json = z
    .object({
      disruption: ExternalDisruption.json,
      provisionalDisruptions: Disruption.json.array(),
    })
    .transform(
      (x) =>
        new ExternalDisruptionInInbox(x.disruption, x.provisionalDisruptions),
    );

  toJSON(): z.input<typeof ExternalDisruptionInInbox.json> {
    return {
      disruption: this.disruption.toJSON(),
      provisionalDisruptions: this.provisionalDisruptions.map((x) =>
        x.toJSON(),
      ),
    };
  }
}
