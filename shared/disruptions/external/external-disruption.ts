import { z } from "zod";
import { ExternalDisruptionData } from "./external-disruption-data";
import { PtvExternalDisruptionData } from "./types/ptv";
import { ExternalDisruptionID } from "./external-disruption-id";

export class ExternalDisruption {
  readonly id: ExternalDisruptionID;
  readonly type: string;

  constructor(readonly data: ExternalDisruptionData) {
    this.id = data.getID();
    this.type = this.id.type;
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
