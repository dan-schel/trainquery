import { z } from "zod";
import { ExternalDisruptionData } from "./external-disruption-data";
import { PtvExternalDisruptionData } from "./types/ptv";
import type { ExternalDisruptionID } from "../../system/ids";

export class ExternalDisruption {
  readonly id: ExternalDisruptionID;
  readonly type: string;

  constructor(readonly data: ExternalDisruptionData) {
    this.id = data.getID();
    this.type = data.getType();
  }

  isOlderVersionOf(other: ExternalDisruption) {
    return this.id === other.id && !this.data.matchesContent(other.data);
  }

  isIdenticalTo(other: ExternalDisruption) {
    return this.id === other.id && this.data.matchesContent(other.data);
  }

  static readonly json = z
    .discriminatedUnion("type", [
      z.object({
        type: z.literal(PtvExternalDisruptionData.type),
        data: PtvExternalDisruptionData.json,
      }),
    ])
    .transform((x) => new ExternalDisruption(x.data));

  toJSON(): z.input<typeof ExternalDisruption.json> {
    if (this.data instanceof PtvExternalDisruptionData) {
      return {
        type: PtvExternalDisruptionData.type,
        data: this.data.toJSON(),
      };
    }

    const className = this.data.constructor.name;
    throw new Error(`Unknown ExternalDisruptionData type: ${className}`);
  }
}
