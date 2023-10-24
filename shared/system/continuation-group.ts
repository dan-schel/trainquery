import { z } from "zod";
import { type LineID, LineIDJson } from "./ids";
import { NumberRange } from "../utils";

export class ContinuationGroup<Method extends String> {
  constructor(readonly method: Method) {}
}

export class LinearContinuationGroup extends ContinuationGroup<"linear"> {
  constructor(
    readonly layoverMins: NumberRange,
    readonly sideA: LineID[],
    readonly sideB: LineID[],
  ) {
    super("linear");
  }

  static readonly json = z
    .object({
      method: z.literal("linear"),
      layoverMins: NumberRange.json,
      sideA: LineIDJson.array(),
      sideB: LineIDJson.array(),
    })
    .transform(
      (x) => new LinearContinuationGroup(x.layoverMins, x.sideA, x.sideB),
    );

  toJSON(): z.input<typeof LinearContinuationGroup.json> {
    return {
      method: "linear",
      layoverMins: this.layoverMins.toJSON(),
      sideA: this.sideA,
      sideB: this.sideB,
    };
  }
}

export class HookContinuationGroup extends ContinuationGroup<"hook"> {
  constructor(
    readonly layoverMins: NumberRange,
    readonly lines: LineID[],
  ) {
    super("hook");
  }

  static readonly json = z
    .object({
      method: z.literal("hook"),
      layoverMins: NumberRange.json,
      lines: LineIDJson.array(),
    })
    .transform((x) => new HookContinuationGroup(x.layoverMins, x.lines));

  toJSON(): z.input<typeof HookContinuationGroup.json> {
    return {
      method: "hook",
      layoverMins: this.layoverMins.toJSON(),
      lines: this.lines,
    };
  }
}
