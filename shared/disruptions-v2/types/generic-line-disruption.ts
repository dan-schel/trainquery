import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { type LineID, LineIDJson } from "../../system/ids";
import { Disruption, DisruptionFactory, RawDisruptionID } from "../disruption";

export class GenericLineDisruption extends Disruption {
  constructor(
    id: string,
    createdAutomatically: boolean,
    sources: RawDisruptionID[],
    readonly message: string,
    readonly affectedLines: LineID[],
    readonly starts: QUtcDateTime,
    readonly ends: QUtcDateTime,
  ) {
    super(id, "generic-line", createdAutomatically, sources);
  }

  static readonly json = z
    .object({
      id: z.string(),
      createdAutomatically: z.boolean(),
      sources: RawDisruptionID.json.array(),
      message: z.string(),
      affectedLines: LineIDJson.array(),
      starts: QUtcDateTime.json,
      ends: QUtcDateTime.json,
    })
    .transform(
      (x) =>
        new GenericLineDisruption(
          x.id,
          x.createdAutomatically,
          x.sources,
          x.message,
          x.affectedLines,
          x.starts,
          x.ends,
        ),
    );

  toJSON(): z.input<typeof GenericLineDisruption.json> {
    return {
      id: this.id,
      createdAutomatically: this.createdAutomatically,
      sources: this.sources,
      message: this.message,
      affectedLines: this.affectedLines,
      starts: this.starts.toJSON(),
      ends: this.ends.toJSON(),
    };
  }
}

export class GenericLineDisruptionFactory extends DisruptionFactory {
  constructor() {
    super("generic-line");
  }

  get jsonSchema(): z.ZodType<Disruption, any, any> {
    return GenericLineDisruption.json;
  }

  toJson(disruption: Disruption): unknown {
    if (disruption instanceof GenericLineDisruption) {
      return disruption.toJSON();
    }
    this._throwSinceBadType(disruption);
  }
}
