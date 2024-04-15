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

export type SerializedRawDisruption<Type extends string = string> = {
  type: Type;
  message: string;
  url: string | null;
  rawData: {
    source: string;
    id: string;
    markdown: string;
    encodedID: string;
  };
  [others: string]: any;
};

export const RawDisruptionJson = z.object({
  type: z.string(),
  message: z.string(),
  url: z.string().nullable(),
  rawData: z.object({
    source: z.string(),
    id: z.string(),
    markdown: z.string(),
    encodedID: z.string(),
  }),
});
