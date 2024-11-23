import { SharedConfig } from "../../shared/system/config/shared-config";
import { FrontendOnlyConfig } from "../../shared/system/config/frontend-only-config";
import { FrontendConfig } from "../../shared/system/config/frontend-config";
import { hashString } from "../../shared/system/cyrb53";
import { ServerOnlyConfig } from "./server-only-config";

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
    readonly frontend: FrontendOnlyConfig,
  ) {
    this.hash = hashString(
      JSON.stringify({
        shared: this.shared.toJSON(),
        frontend: this.frontend.toJSON(),
      }),
    );
  }

  forFrontend(): FrontendConfig {
    return new FrontendConfig(this.hash, this.shared, this.frontend);
  }
}
