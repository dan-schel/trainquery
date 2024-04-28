import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { type StopID, StopIDJson } from "../../system/ids";
import { Disruption, DisruptionFactory } from "../disruption";
import { ProposedDisruptionID } from "../proposed/proposed-disruption";

const disruptionType = "generic-line";

export class GenericStopDisruption extends Disruption {
  constructor(
    id: string,
    createdAutomatically: boolean,
    sources: ProposedDisruptionID[],

    // TODO: For now the frontend requires a URL, but in future tapping into a
    // disruption should open its own page and the sources field should be used
    // to render the PTV disruption it was created from.
    url: string | null,

    readonly message: string,
    readonly affectedStops: StopID[],
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
      affectedStops: StopIDJson.array(),
      starts: QUtcDateTime.json.nullable(),
      ends: QUtcDateTime.json.nullable(),
    })
    .transform(
      (x) =>
        new GenericStopDisruption(
          x.id,
          x.createdAutomatically,
          x.sources,
          x.url,
          x.message,
          x.affectedStops,
          x.starts,
          x.ends,
        ),
    );

  toJSON(): z.input<typeof GenericStopDisruption.json> {
    return {
      id: this.id,
      createdAutomatically: this.createdAutomatically,
      sources: this.sources,
      url: this.url,
      message: this.message,
      affectedStops: this.affectedStops,
      starts: this.starts?.toJSON() ?? null,
      ends: this.ends?.toJSON() ?? null,
    };
  }
}

export class GenericStopDisruptionFactory extends DisruptionFactory {
  constructor() {
    super(disruptionType);
  }

  get jsonSchema(): z.ZodType<Disruption, any, any> {
    return GenericStopDisruption.json;
  }

  toJson(disruption: Disruption): unknown {
    if (disruption instanceof GenericStopDisruption) {
      return disruption.toJSON();
    }
    this._throwSinceBadType(disruption);
  }
}
