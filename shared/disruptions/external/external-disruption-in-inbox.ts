import { z } from "zod";
import { ExternalDisruption } from "./external-disruption";
import {
  ExternalDisruptionIDJson,
  type ExternalDisruptionID,
} from "../../system/ids";

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
    return this.id === other.id;
  }

  static readonly json = z
    .object({
      // Redundant, but allows makes delete commands in MongoDB cleaner.
      // TODO: Maybe it this is another situation that calls for toMongo().
      id: ExternalDisruptionIDJson,
      disruption: ExternalDisruption.json,
    })
    .transform((x) => new ExternalDisruptionInInbox(x.disruption));

  toJSON(): z.input<typeof ExternalDisruptionInInbox.json> {
    return {
      id: this.id,
      disruption: this.disruption.toJSON(),
    };
  }
}
