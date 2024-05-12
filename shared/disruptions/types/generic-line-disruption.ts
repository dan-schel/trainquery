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
    url: string | null,
    readonly message: string,
    readonly affectedLines: LineID[],
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {
    // TODO: I realise message is only being used for summary, so the field is
    // essentially duplicated. I feel that it makes sense to "generate" the
    // summary from the message, but idk, this is weird.
    super(disruptionType, id, createdAutomatically, sources, message, url);
  }

  static readonly json = z
    .object({
      id: z.string(),
      createdAutomatically: z.boolean(),
      sources: ProposedDisruptionID.json.array(),
      url: z.string().nullable(),
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
          x.url,
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
      url: this.url,
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
