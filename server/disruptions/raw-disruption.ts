import { Disruption } from "./disruption";
import { TrainQuery } from "../ctx/trainquery";
import {
  DisruptionSourceID,
  RawDisruptionIDComponents,
} from "./raw-disruption-id-components";
import { SerializedRawDisruption } from "../../shared/disruptions/serialized-disruption";

export type RawDisruptionSourceData = {
  source: DisruptionSourceID;
  id: string;
  hash: string;
};

export abstract class RawDisruption<
  Type extends string = string,
> extends Disruption<Type> {
  constructor(
    type: Type,
    readonly source: DisruptionSourceID,
    readonly id: string,
    readonly hash: string,
  ) {
    super(type);
  }

  abstract createInfoMarkdown(ctx: TrainQuery): string;

  toJSON(ctx: TrainQuery): SerializedRawDisruption<Type> {
    const custom = this.getCustomJSON(ctx);
    return {
      type: this.type,
      rawData: {
        source: this.source,
        id: this.id,
        markdown: this.createInfoMarkdown(ctx),
        encodedID: new RawDisruptionIDComponents(this.source, this.id).encode(),
      },
      ...custom,
    };
  }
}
