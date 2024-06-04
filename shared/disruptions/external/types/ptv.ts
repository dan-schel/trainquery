import { z } from "zod";
import { QUtcDateTime } from "../../../qtime/qdatetime";
import { hashString } from "../../../system/cyrb53";
import {
  type LineID,
  LineIDJson,
  type StopID,
  StopIDJson,
  type ExternalDisruptionID,
} from "../../../system/ids";
import { ExternalDisruptionData } from "../external-disruption-data";

export class PtvExternalDisruptionData extends ExternalDisruptionData {
  static readonly type = "ptv";

  private readonly _hash: string;

  constructor(
    readonly id: number,
    readonly title: string,
    readonly description: string,
    readonly affectedLines: LineID[],
    readonly affectedStops: StopID[],
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
    readonly url: string | null,
  ) {
    super();
    this._hash = hashString(
      JSON.stringify({
        title: this.title,
        description: this.description,
        affectedLines: this.affectedLines,
        affectedStops: this.affectedStops,
        url: this.url,
        starts: this.starts?.toJSON(),
        ends: this.ends?.toJSON(),
      }),
    );
  }

  static readonly json = z
    .object({
      id: z.number(),
      title: z.string(),
      description: z.string(),
      affectedLines: LineIDJson.array(),
      affectedStops: StopIDJson.array(),
      starts: QUtcDateTime.json.nullable(),
      ends: QUtcDateTime.json.nullable(),
      url: z.string().nullable(),
    })
    .transform(
      (x) =>
        new PtvExternalDisruptionData(
          x.id,
          x.title,
          x.description,
          x.affectedLines,
          x.affectedStops,
          x.starts,
          x.ends,
          x.url,
        ),
    );

  getID(): ExternalDisruptionID {
    return this._createID(this.id.toFixed());
  }
  getType(): string {
    return PtvExternalDisruptionData.type;
  }
  getStarts(): QUtcDateTime | null {
    return this.starts;
  }
  getEnds(): QUtcDateTime | null {
    return this.ends;
  }

  matchesContent(other: ExternalDisruptionData): boolean {
    return (
      other instanceof PtvExternalDisruptionData && this._hash === other._hash
    );
  }

  toJSON(): z.input<typeof PtvExternalDisruptionData.json> {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      affectedLines: this.affectedLines,
      affectedStops: this.affectedStops,
      starts: this.starts?.toJSON() ?? null,
      ends: this.ends?.toJSON() ?? null,
      url: this.url,
    };
  }
}
