import { z } from "zod";
import { ProposedDisruptionID } from "./proposed/proposed-disruption";

export abstract class Disruption {
  constructor(
    readonly type: string,
    readonly id: string,
    readonly createdAutomatically: boolean,
    readonly sources: ProposedDisruptionID[],
    readonly summary: string,
    // TODO: For now the frontend requires a URL, but in future tapping into a
    // disruption should open its own page and the sources field should be used
    // to render the PTV disruption it was created from.
    readonly url: string | null,
  ) {}
}

export abstract class DisruptionFactory {
  constructor(readonly type: string) {}

  abstract get jsonSchema(): z.ZodType<Disruption, any, any>;
  abstract toJson(disruption: Disruption): unknown;

  protected _throwSinceBadType(disruption: Disruption): never {
    throw new Error(
      `Factory for "${this.type}" can't serialize "${disruption.type}".`,
    );
  }
}
