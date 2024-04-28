import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { type HasSharedConfig } from "../../system/config-utils";

export class ProposedDisruptionID {
  constructor(
    readonly source: string,
    readonly idAtSource: string,
  ) {}

  static readonly json = z
    .object({
      source: z.string(),
      idAtSource: z.string(),
    })
    .transform((x) => new ProposedDisruptionID(x.source, x.idAtSource));

  toJSON(): z.input<typeof ProposedDisruptionID.json> {
    return {
      source: this.source,
      idAtSource: this.idAtSource,
    };
  }
}

export abstract class ProposedDisruption {
  constructor(
    readonly type: string,
    readonly id: ProposedDisruptionID,
  ) {}

  abstract getMarkdown(config: HasSharedConfig): string;
  abstract getStart(): QUtcDateTime | null;
  abstract getEnd(): QUtcDateTime | null;
}

export abstract class ProposedDisruptionFactory {
  constructor(readonly type: string) {}

  abstract get jsonSchema(): z.ZodType<ProposedDisruption, any, any>;
  abstract toJson(disruption: ProposedDisruption): unknown;

  protected _throwSinceBadType(disruption: ProposedDisruption): never {
    throw new Error(
      `Factory for "${this.type}" can't serialize "${disruption.type}".`,
    );
  }
}
