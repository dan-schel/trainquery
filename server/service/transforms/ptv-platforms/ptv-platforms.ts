import {
  Service,
  StoppingPatternType,
} from "../../../../shared/system/service/service";
import { PtvPlatformsSubsystem } from "../../../subsystem/ptv-platforms/ptv-platforms";
import { ServiceTransform } from "../transform";

export class PtvPlatformsServiceTransform<
  T extends StoppingPatternType,
> extends ServiceTransform<T> {
  constructor(private readonly subsystem: PtvPlatformsSubsystem) {
    super();
  }

  transform(service: Service<T>): Service<T> {
    const knownPlatforms = this.subsystem.getKnownPlatforms();

    // eslint-disable-next-line no-console
    console.log(`About to transform with: ${knownPlatforms}`);

    // TODO: Implement this.
    return service;
  }
}
