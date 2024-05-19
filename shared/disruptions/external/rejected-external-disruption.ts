import { z } from "zod";
import { ExternalDisruption } from "./external-disruption";

export class RejectedExternalDisruption {
  constructor(
    readonly disruption: ExternalDisruption,
    readonly resurfaceIfUpdated: boolean,
  ) {}

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
