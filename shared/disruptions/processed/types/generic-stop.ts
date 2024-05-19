import { z } from "zod";
import { QUtcDateTime } from "../../../qtime/qdatetime";
import { type StopID, StopIDJson } from "../../../system/ids";
import { DisruptionData } from "../disruption-data";

export class GenericStopDisruptionData extends DisruptionData {
  static readonly type = "generic-stop";

  constructor(
    readonly message: string,
    readonly affectedStops: StopID[],
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {
    super();
  }

  getType(): string {
    return GenericStopDisruptionData.type;
  }

  static readonly json = z
    .object({
      message: z.string(),
      affectedStops: StopIDJson.array(),
      starts: QUtcDateTime.json.nullable(),
      ends: QUtcDateTime.json.nullable(),
    })
    .transform(
      (x) =>
        new GenericStopDisruptionData(
          x.message,
          x.affectedStops,
          x.starts,
          x.ends,
        ),
    );

  toJSON(): z.input<typeof GenericStopDisruptionData.json> {
    return {
      message: this.message,
      affectedStops: this.affectedStops,
      starts: this.starts?.toJSON() ?? null,
      ends: this.ends?.toJSON() ?? null,
    };
  }
}
