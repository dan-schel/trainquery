import { z } from "zod";
import {
  FrontendOnlyConfig,
  ServerOnlyConfig,
  SharedConfig,
} from "./config-elements";
import { hashString } from "./cyrb53";

/** The server's config object, which includes the shared properties. */
export class ServerConfig {
  /** Used to quickly determine if cached config is outdated. */
  readonly hash: string;

  constructor(
    /** Shared config properties. */
    readonly shared: SharedConfig,
    /** Server exclusive config properties. */
    readonly server: ServerOnlyConfig,
    /**
     * Frontend config properties, available here for SSR and to enable
     * distribution to the client.
     */
    readonly frontend: FrontendOnlyConfig
  ) {
    this.hash = hashString(
      JSON.stringify({
        shared: this.shared.toJSON(),
        frontend: this.frontend.toJSON(),
      })
    );
  }

  forFrontend(): FrontendConfig {
    return new FrontendConfig(this.hash, this.shared, this.frontend);
  }
}

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
