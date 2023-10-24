import { z } from "zod";
import { type LineID, LineIDJson, type StopID, StopIDJson } from "./ids";
import { NumberRange } from "../utils";

export abstract class ContinuationGroup<Method extends String> {
  constructor(readonly method: Method) {}
}

export class LinearContinuationGroup extends ContinuationGroup<"linear"> {
  constructor(
    readonly from: StopID,
    readonly sideA: LineID[],
    readonly sideB: LineID[],
    readonly layoverMins: NumberRange,
  ) {
    super("linear");
  }

  static readonly json = z
    .object({
      method: z.literal("linear"),
      from: StopIDJson,
      sideA: LineIDJson.array(),
      sideB: LineIDJson.array(),
      layoverMins: NumberRange.json,
    })
    .transform(
      (x) =>
        new LinearContinuationGroup(x.from, x.sideA, x.sideB, x.layoverMins),
    );

  toJSON(): z.input<typeof LinearContinuationGroup.json> {
    return {
      method: "linear",
      from: this.from,
      sideA: this.sideA,
      sideB: this.sideB,
      layoverMins: this.layoverMins.toJSON(),
    };
  }
}

export class HookContinuationGroup extends ContinuationGroup<"hook"> {
  constructor(
    readonly lines: LineID[],
    readonly layoverMins: NumberRange,
  ) {
    super("hook");
  }

  static readonly json = z
    .object({
      method: z.literal("hook"),
      lines: LineIDJson.array(),
      layoverMins: NumberRange.json,
    })
    .transform((x) => new HookContinuationGroup(x.lines, x.layoverMins));

  toJSON(): z.input<typeof HookContinuationGroup.json> {
    return {
      method: "hook",
      lines: this.lines,
      layoverMins: this.layoverMins.toJSON(),
    };
  }
}
