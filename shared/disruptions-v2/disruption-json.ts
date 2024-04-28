import { z } from "zod";
import { Disruption, DisruptionFactory } from "./disruption";
import { GenericLineDisruptionFactory } from "./types/generic-line-disruption";
import { GenericStopDisruptionFactory } from "./types/generic-stop-disruption";

const array: DisruptionFactory[] = [
  new GenericLineDisruptionFactory(),
  new GenericStopDisruptionFactory(),
];
const map = new Map<string, DisruptionFactory>(array.map((x) => [x.type, x]));

export const DisruptionJson = z
  .object({
    type: z.string(),
    data: z.any(),
  })
  .transform((x, ctx) => {
    const factory = map.get(x.type);
    if (factory == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown "${x.type}" disruption type.`,
      });
      return z.NEVER;
    }

    const result = factory.jsonSchema.safeParse(x.data);
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        ctx.addIssue({
          // Zod forces this to be "custom" even though it would make more sense
          // to use issue.code.
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: ["data", ...issue.path],
        }),
      );
      return z.NEVER;
    }

    return result.data;
  });

export function disruptionToJson(disruption: Disruption) {
  const factory = map.get(disruption.type);
  if (factory == null) {
    throw new Error(`Unknown "${disruption.type}" disruption type.`);
  }

  return {
    type: disruption.type,
    data: factory.toJson(disruption),
  };
}
