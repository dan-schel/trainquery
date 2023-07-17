import { z } from "zod";
import { FrontendOnlyConfig, ServerOnlyConfig, SharedConfig } from "./config-elements";

/** The server's config object, which includes the shared properties. */
export class ServerConfig {
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
    this.shared = shared;
    this.server = server;
    this.frontend = frontend;
  }

  static readonly json = z
    .object({
      shared: SharedConfig.json,
      server: ServerOnlyConfig.json,
      frontend: FrontendOnlyConfig.json,
    })
    .transform((x) => new ServerConfig(x.shared, x.server, x.frontend));

  toJSON(): z.input<typeof ServerConfig.json> {
    return {
      shared: this.shared.toJSON(),
      server: this.server.toJSON(),
      frontend: this.frontend.toJSON(),
    };
  }
}

/** The frontend's config object, which includes the shared properties. */
export class FrontendConfig {
  constructor(
    /** Shared config properties. */
    readonly shared: SharedConfig,
    /** Frontend config properties. */
    readonly frontend: FrontendOnlyConfig
  ) {
    this.shared = shared;
    this.frontend = frontend;
  }

  static readonly json = z
    .object({
      shared: SharedConfig.json,
      frontend: FrontendOnlyConfig.json,
    })
    .transform((x) => new FrontendConfig(x.shared, x.frontend));

  toJSON(): z.input<typeof FrontendConfig.json> {
    return {
      shared: this.shared.toJSON(),
      frontend: this.frontend.toJSON(),
    };
  }
}
