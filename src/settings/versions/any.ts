import { z } from "zod";

export const anySettingsVersion = z
  .object({
    version: z.string(),
  })
  .passthrough();
