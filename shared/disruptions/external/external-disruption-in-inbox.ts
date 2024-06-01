import { z } from "zod";
import { ExternalDisruption } from "./external-disruption";
import { ExternalDisruptionID } from "./external-disruption-id";

// NOTE: The only reason we use ExternalDisruptionInInbox instead of just
// ExternalDisruption to represent things in the inbox is in case we ever want
// to store additional metadata about the disruption in the inbox, e.g. whether
// it's been seen, just like we do for RejectedExternalDisruption and its
// resurfaceIfUpdated field.

export class ExternalDisruptionInInbox {
  readonly id: ExternalDisruptionID;

  constructor(readonly disruption: ExternalDisruption) {
    this.id = disruption.id;
  }

  hasSameID(other: ExternalDisruption) {
    return this.id.equals(other.id);
  }

  static readonly json = z
    .object({
      disruption: ExternalDisruption.json,
    })
    .transform((x) => new ExternalDisruptionInInbox(x.disruption));

  toJSON(): z.input<typeof ExternalDisruptionInInbox.json> {
    return {
      disruption: this.disruption.toJSON(),
    };
  }
}
