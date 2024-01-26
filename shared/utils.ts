import { NumberRange, parseIntNull } from "@schel-d/js-utils";
import { z } from "zod";

// NOTE: While I'd love to move this stuff to @schel-d/js-utils, the zod stuff
// can't go (at least the mapJson function) because zod uses instanceof in some
// places, which doesn't work with multiple instances of the same package!
//
// This discussion might have a solution ("--packages=external" or something?)
// https://github.com/evanw/esbuild/issues/3333

/**
 * Records a Zod schema that parses {@link Map}s (which are expressed as records
 * in JSON).
 * @param keySchema Zod schema to validate the keys against.
 * @param valueSchema Zod schema to validatee the values against.
 */
export function mapJson<A extends string | number, B>(
  keySchema: z.ZodType<A, z.ZodTypeDef, string>,
  valueSchema: z.ZodType<B, z.ZodTypeDef, unknown>,
): z.ZodType<Map<A, B>, z.ZodTypeDef, unknown> {
  return z.record(z.string(), valueSchema).transform((x, ctx) => {
    const result = new Map<A, B>();
    for (const [key, value] of Object.entries(x)) {
      const parsedKey = keySchema.safeParse(key);
      if (parsedKey.success) {
        result.set(parsedKey.data, value);
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Record contained invalid key.",
        });
        return z.NEVER;
      }
    }
    return result;
  });
}

/** A zod schema for parsing integers expressed as strings. */
export const IntStringJson = z.string().transform((x, ctx) => {
  const result = parseIntNull(x);
  if (result == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not an integer.",
    });
    return z.NEVER;
  }
  return result;
});

/** A zod schema for parsing numbers expressed as strings. */
export const NumberStringJson = z.string().transform((x, ctx) => {
  const result = parseFloat(x);
  if (isNaN(result)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a number.",
    });
    return z.NEVER;
  }
  return result;
});

export const NumberRangeJson = z.string().transform((x, ctx) => {
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

export type ErrorLogger = (error: string) => void;
