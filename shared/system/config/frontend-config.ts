import { z } from "zod";
import { FrontendOnlyConfig } from "./frontend-only-config";
import { SharedConfig } from "./shared-config";

/** The frontend's config object, which includes the shared properties. */
export class FrontendConfig {
  constructor(
    /** Used to quickly determine if cached config is outdated. */
    readonly hash: string,
    /** Shared config properties. */
    readonly shared: SharedConfig,
    /** Frontend config properties. */
    readonly frontend: FrontendOnlyConfig
  ) {}

  static readonly json = z
    .object({
      hash: z.string(),
      shared: SharedConfig.json,
      frontend: FrontendOnlyConfig.json,
    })
    .transform((x) => new FrontendConfig(x.hash, x.shared, x.frontend));

  toJSON(): z.input<typeof FrontendConfig.json> {
    return {
      hash: this.hash,
      shared: this.shared.toJSON(),
      frontend: this.frontend.toJSON(),
    };
  }
}
