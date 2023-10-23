import { z } from "zod";
import { LineID, LineIDJson } from "../../shared/system/ids";

export class NumberRange {
  constructor(
    readonly min: number,
    readonly max: number,
  ) {}

  static parse(input: string): NumberRange | null {
    if (!input.includes("..")) {
      const n = parseFloat(input);
      if (isNaN(n)) {
        return null;
      }
      return new NumberRange(n, n);
    }

    const components = input.split("..");
    if (components.length != 2) {
      return null;
    }
    const min = parseFloat(components[0]);
    const max = parseFloat(components[1]);
    if (isNaN(min) || isNaN(max)) {
      return null;
    }
    return new NumberRange(min, max);
  }

  asString() {
    if (this.min == this.max) {
      return this.min.toString();
    }
    return `${this.min}..${this.max}`;
  }

  static readonly json = z.string().transform((x, ctx) => {
    const result = NumberRange.parse(x);
    if (result == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a valid number range.",
      });
      return z.NEVER;
    }
    return result;
  });

  toJSON(): z.input<typeof NumberRange.json> {
    return this.asString();
  }
}

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
}

export class ContinuationConfig {
  constructor(
    readonly rules: (LinearContinuationGroup | HookContinuationGroup)[],
  ) {}

  static readonly json = z
    .object({
      rules: z
        .union([LinearContinuationGroup.json, HookContinuationGroup.json])
        .array(),
    })
    .transform((x) => new ContinuationConfig(x.rules));
}
