import { z } from "zod";

export type SerializedDisruption<Type extends string = string> = {
  type: Type;
  message: string;
  url: string | null;
  [others: string]: any;
};

// TODO: Expand this to a z.union when required if some disruption types have
// custom data.
export const DisruptionJson = z.object({
  type: z.string(),
  message: z.string(),
  url: z.string().nullable(),
});
