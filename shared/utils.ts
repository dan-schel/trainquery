import { z } from "zod";

export function mapJson<A extends string | number, B>(
  keySchema: z.ZodType<A, z.ZodTypeDef, string>,
  valueSchema: z.ZodType<B, z.ZodTypeDef, any>
): z.ZodType<Map<A, B>, z.ZodTypeDef, any> {
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
