import { z } from "zod";
import { QUtcDateTime } from "../qtime/qdatetime";

export class RawDisruptionID {
  constructor(
    readonly source: string,
    readonly idAtSource: string,
  ) {}

  static readonly json = z
    .object({
      source: z.string(),
      idAtSource: z.string(),
    })
    .transform((x) => new RawDisruptionID(x.source, x.idAtSource));

  toJSON(): z.input<typeof RawDisruptionID.json> {
    return {
      source: this.source,
      idAtSource: this.idAtSource,
    };
  }
}

export class RawDisruption {
  constructor(
    readonly id: RawDisruptionID,
    readonly markdown: string,
    readonly starts: QUtcDateTime,
    readonly ends: QUtcDateTime,
  ) {}

  static readonly json = z
    .object({
      id: RawDisruptionID.json,
      markdown: z.string(),
      starts: QUtcDateTime.json,
      ends: QUtcDateTime.json,
    })
    .transform((x) => new RawDisruption(x.id, x.markdown, x.starts, x.ends));

  toJSON(): z.input<typeof RawDisruption.json> {
    return {
      id: this.id,
      markdown: this.markdown,
      starts: this.starts.toJSON(),
      ends: this.ends.toJSON(),
    };
  }
}

export abstract class Disruption {
  constructor(
    readonly id: string,
    readonly type: string,
    readonly createdAutomatically: boolean,

    // TODO: Could a URL be a source, even if a raw disruption isn't what is
    // ultimately providing the URL?
    readonly sources: RawDisruptionID[],
  ) {}
}

export abstract class DisruptionFactory {
  constructor(readonly type: string) {}

  abstract get jsonSchema(): z.ZodType<Disruption, any, any>;
  abstract toJson(disruption: Disruption): unknown;

  protected _throwSinceBadType(disruption: Disruption): never {
    throw new Error(
      `Factory for "${this.type}" can't serialize "${disruption.type}".`,
    );
  }
}
