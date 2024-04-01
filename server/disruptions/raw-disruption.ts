import { z } from "zod";
import { Disruption } from "./disruption";
import { TrainQuery } from "../ctx/trainquery";

export const DisruptionSources = ["ptv"] as const;
export type DisruptionSource = (typeof DisruptionSources)[number];
export const DisruptionSourceJson = z.enum(DisruptionSources);

export type RawDisruptionSourceData = {
  source: DisruptionSource;
  id: string;
  hash: string;
};

export abstract class RawDisruption<
  Type extends string = string,
> extends Disruption<Type> {
  constructor(
    readonly source: DisruptionSource,
    readonly id: string,
    readonly hash: string,
  ) {
    super();
  }

  abstract createInfoMarkdown(ctx: TrainQuery): string;
}
