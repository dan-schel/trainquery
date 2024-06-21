import { z } from "zod";
import { ExternalDisruption } from "./external-disruption";
import {
  ExternalDisruptionIDJson,
  type ExternalDisruptionID,
} from "../../system/ids";

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
    return this.id === other.id;
  }

  static readonly json = z
    .object({
      // Redundant, but allows makes delete commands in MongoDB cleaner.
      // TODO: Maybe it this is another situation that calls for toMongo().
      id: ExternalDisruptionIDJson,
      disruption: ExternalDisruption.json,
      resurfaceIfUpdated: z.boolean(),
    })
    .transform(
      (x) => new RejectedExternalDisruption(x.disruption, x.resurfaceIfUpdated),
    );

  toJSON(): z.input<typeof RejectedExternalDisruption.json> {
    return {
      id: this.id,
      disruption: this.disruption.toJSON(),
      resurfaceIfUpdated: this.resurfaceIfUpdated,
    };
  }
}
