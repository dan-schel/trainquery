import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { type HasSharedConfig } from "../../system/config-utils";
import { base48Safe, reencode, tryReencode } from "@dan-schel/js-utils";
import { hexToString, stringToHex } from "../../utils";

const encodedAlpha = "0123456789abcdef|";

export class ProposedDisruptionID {
  constructor(
    readonly source: string,
    readonly idAtSource: string,
  ) {}

  equals(other: ProposedDisruptionID) {
    return this.source === other.source && this.idAtSource === other.idAtSource;
  }

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

  encodeForUrl(): string {
    const asString =
      stringToHex(this.source) + "|" + stringToHex(this.idAtSource);
    return reencode(asString, encodedAlpha, base48Safe);
  }

  static decodeFromUrl(input: string): ProposedDisruptionID | null {
    const decodedString = tryReencode(input, base48Safe, encodedAlpha);
    if (decodedString == null) {
      return null;
    }

    const components = decodedString.split("|");
    if (components.length !== 2) {
      return null;
    }

    if (
      !/^[0-9a-f]+$/g.test(components[0]) ||
      !/^[0-9a-f]+$/g.test(components[1])
    ) {
      return null;
    }
    const source = hexToString(components[0]);
    const idAtSource = hexToString(components[1]);

    return new ProposedDisruptionID(source, idAtSource);
  }
}

export abstract class ProposedDisruption {
  constructor(
    readonly type: string,
    readonly id: ProposedDisruptionID,
    readonly summary: string,
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {}

  abstract getMarkdown(config: HasSharedConfig): string;
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
