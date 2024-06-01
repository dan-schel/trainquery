import { z } from "zod";
import { ExternalDisruption } from "./external-disruption";
import { ExternalDisruptionID } from "./external-disruption-id";

export class RejectedExternalDisruption {
  readonly id: ExternalDisruptionID;

  constructor(
    readonly disruption: ExternalDisruption,
    readonly resurfaceIfUpdated: boolean,
  ) {
    this.id = disruption.id;
  }

  overturnsRejection(update: ExternalDisruption) {
    return this.resurfaceIfUpdated && this.disruption.isOlderVersionOf(update);
  }

  hasSameID(other: ExternalDisruption) {
    return this.id.equals(other.id);
  }

  static readonly json = z
    .object({
      disruption: ExternalDisruption.json,
      resurfaceIfUpdated: z.boolean(),
    })
    .transform(
      (x) => new RejectedExternalDisruption(x.disruption, x.resurfaceIfUpdated),
    );

  toJSON(): z.input<typeof RejectedExternalDisruption.json> {
    return {
      disruption: this.disruption.toJSON(),
      resurfaceIfUpdated: this.resurfaceIfUpdated,
    };
  }
}
