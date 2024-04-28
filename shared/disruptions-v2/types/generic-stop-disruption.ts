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
    readonly message: string,
    readonly affectedStops: StopID[],
    readonly starts: QUtcDateTime,
    readonly ends: QUtcDateTime,
  ) {
    super(disruptionType, id, createdAutomatically, sources);
  }

  static readonly json = z
    .object({
      id: z.string(),
      createdAutomatically: z.boolean(),
      sources: ProposedDisruptionID.json.array(),
      message: z.string(),
      affectedStops: StopIDJson.array(),
      starts: QUtcDateTime.json,
      ends: QUtcDateTime.json,
    })
    .transform(
      (x) =>
        new GenericStopDisruption(
          x.id,
          x.createdAutomatically,
          x.sources,
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
      message: this.message,
      affectedStops: this.affectedStops,
      starts: this.starts.toJSON(),
      ends: this.ends.toJSON(),
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
