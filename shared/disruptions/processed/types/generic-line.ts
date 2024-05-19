import { z } from "zod";
import { QUtcDateTime } from "../../../qtime/qdatetime";
import { type LineID, LineIDJson } from "../../../system/ids";
import { DisruptionData } from "../disruption-data";

export class GenericLineDisruptionData extends DisruptionData {
  static readonly type = "generic-line";

  constructor(
    readonly message: string,
    readonly affectedLines: LineID[],
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {
    super();
  }

  getType(): string {
    return GenericLineDisruptionData.type;
  }

  static readonly json = z
    .object({
      message: z.string(),
      affectedLines: LineIDJson.array(),
      starts: QUtcDateTime.json.nullable(),
      ends: QUtcDateTime.json.nullable(),
    })
    .transform(
      (x) =>
        new GenericLineDisruptionData(
          x.message,
          x.affectedLines,
          x.starts,
          x.ends,
        ),
    );

  toJSON(): z.input<typeof GenericLineDisruptionData.json> {
    return {
      message: this.message,
      affectedLines: this.affectedLines,
      starts: this.starts?.toJSON() ?? null,
      ends: this.ends?.toJSON() ?? null,
    };
  }
}
