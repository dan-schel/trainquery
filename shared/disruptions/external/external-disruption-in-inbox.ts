import { z } from "zod";
import { Disruption } from "../processed/disruption";
import { ExternalDisruption } from "./external-disruption";
import { ExternalDisruptionID } from "./external-disruption-id";

export class ExternalDisruptionInInbox {
  readonly id: ExternalDisruptionID;

  constructor(
    readonly disruption: ExternalDisruption,
    readonly provisionalDisruptions: Disruption[],
  ) {
    this.id = disruption.id;
  }

  hasSameID(other: ExternalDisruption) {
    return this.id.equals(other.id);
  }

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
