import { TrainQuery } from "../../../ctx/trainquery";
import { RawDisruption } from "../../raw-disruption";
import { PtvRawDisruptionData } from "./ptv-raw-disruption-data";

export abstract class PtvRawDisruption<
  Type extends string = string,
> extends RawDisruption<Type> {
  constructor(
    type: Type,
    readonly ptvData: PtvRawDisruptionData,
  ) {
    super(type, "ptv", ptvData.id.toFixed(), ptvData.hash);
  }

  createInfoMarkdown(ctx: TrainQuery): string {
    return this.ptvData.createInfoMarkdown(ctx);
  }
}
