import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { type LineID, LineIDJson } from "../../system/ids";
import { Disruption, DisruptionFactory } from "../disruption";
import { ProposedDisruptionID } from "../proposed/proposed-disruption";

const disruptionType = "generic-line";

export class GenericLineDisruption extends Disruption {
  constructor(
    id: string,
    createdAutomatically: boolean,
    sources: ProposedDisruptionID[],
    readonly message: string,
    readonly affectedLines: LineID[],
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {
    super(disruptionType, id, createdAutomatically, sources);
  }

  static readonly json = z
    .object({
      id: z.string(),
      createdAutomatically: z.boolean(),
      sources: ProposedDisruptionID.json.array(),
      message: z.string(),
      affectedLines: LineIDJson.array(),
      starts: QUtcDateTime.json.nullable(),
      ends: QUtcDateTime.json.nullable(),
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
      starts: this.starts?.toJSON() ?? null,
      ends: this.ends?.toJSON() ?? null,
    };
  }
}

export class GenericLineDisruptionFactory extends DisruptionFactory {
  constructor() {
    super(disruptionType);
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
