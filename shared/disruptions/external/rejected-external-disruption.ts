import { z } from "zod";
import { ExternalDisruption } from "./external-disruption";
import {
  ExternalDisruptionIDJson,
  type ExternalDisruptionID,
} from "../../system/ids";
import { QUtcDateTime } from "../../qtime/qdatetime";

export class RejectedExternalDisruption {
  // TODO: Refactor to use a getter instead of a field, and only add it with
  // toMongo() for database purposes.
  readonly id: ExternalDisruptionID;

  constructor(
    readonly disruption: ExternalDisruption,
    readonly resurfaceIfUpdated: boolean,
    readonly deletedAt: QUtcDateTime | null,
  ) {
    this.id = disruption.id;
  }

  overturnsRejection(update: ExternalDisruption) {
    return this.resurfaceIfUpdated && this.disruption.isOlderVersionOf(update);
  }

  hasSameID(other: ExternalDisruption) {
    return this.id === other.id;
  }

  withDeletionScheduled(at: QUtcDateTime) {
    return new RejectedExternalDisruption(
      this.disruption,
      this.resurfaceIfUpdated,
      at,
    );
  }

  withDeletionCancelled() {
    return new RejectedExternalDisruption(
      this.disruption,
      this.resurfaceIfUpdated,
      null,
    );
  }

  static readonly json = z
    .object({
      // Redundant, but allows makes delete commands in MongoDB cleaner.
      // TODO: Maybe it this is another situation that calls for toMongo().
      id: ExternalDisruptionIDJson,
      disruption: ExternalDisruption.json,
      resurfaceIfUpdated: z.boolean(),
      deleteAt: QUtcDateTime.json.nullable(),
    })
    .transform(
      (x) =>
        new RejectedExternalDisruption(
          x.disruption,
          x.resurfaceIfUpdated,
          x.deleteAt,
        ),
    );

  toJSON(): z.input<typeof RejectedExternalDisruption.json> {
    return {
      id: this.id,
      disruption: this.disruption.toJSON(),
      resurfaceIfUpdated: this.resurfaceIfUpdated,
      deleteAt: this.deletedAt?.toJSON() ?? null,
    };
  }
}
