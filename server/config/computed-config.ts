import { OffsetCalculator } from "../timetable/offset-calculator";
import { ServerConfig } from "./server-config";

export type ComputedConfig = {
  offset: OffsetCalculator;
};

/** Like server config, but also contains the additional computed fields. */
export class FullConfig extends ServerConfig {
  readonly computed: ComputedConfig;
  // readonly fullHash: string;

  constructor(config: ServerConfig /* oldConfig: ServerConfig */) {
    super(config.shared, config.server, config.frontend);

    // TODO: Re-use old computed value unless the config changed. Note: hash
    // value is only calculated on frontend and shared properties, which makes
    // sense for invalidating the frontend's cache, but wouldn't work for this,
    // so we might need to calculate a hash for everything somehow.

    // this.fullHash = calculateFullHash(config);
    // if (this.fullHash != oldConfig.fullHash) {
    //   this.computed = {
    //     offset: new OffsetCalculator(config.shared.timezone)
    //   };
    // }
    // else {
    //   this.computed = oldConfig.computed;
    // }

    this.computed = {
      offset: new OffsetCalculator(config.shared.timezone),
    };
  }
}

// function calculateFullHash(config: ServerConfig) {
//   return "TODO";
// }
