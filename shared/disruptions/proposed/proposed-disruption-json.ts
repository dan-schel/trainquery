import { z } from "zod";
import {
  ProposedDisruption,
  ProposedDisruptionFactory,
  ProposedDisruptionID,
} from "./proposed-disruption";
import { PtvProposedDisruptionFactory } from "./types/ptv-proposed-disruption";

const array: ProposedDisruptionFactory[] = [new PtvProposedDisruptionFactory()];
const map = new Map<string, ProposedDisruptionFactory>(
  array.map((x) => [x.type, x]),
);

export const ProposedDisruptionJson = z
  .object({
    id: ProposedDisruptionID.json,
    type: z.string(),
    data: z.any(),
  })
  .transform((x, ctx) => {
    const factory = map.get(x.type);
    if (factory == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unknown "${x.type}" proposed disruption type.`,
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

export function proposedDisruptionToJson(disruption: ProposedDisruption) {
  const factory = map.get(disruption.type);
  if (factory == null) {
    throw new Error(`Unknown "${disruption.type}" proposed disruption type.`);
  }

  return {
    // This is duplicated in "data", but it's added here too to ensure all
    // disruption types provide it under the same key so we can query the
    // database by it.
    id: disruption.id.toJSON(),

    type: disruption.type,
    data: factory.toJson(disruption),
  };
}
