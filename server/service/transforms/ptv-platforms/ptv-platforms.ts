import {
  Service,
  StoppingPatternType,
} from "../../../../shared/system/service/service";
import { PtvPlatformsSubsystem } from "../../../subsystem/ptv-platforms/ptv-platforms";
import { ServiceTransform } from "../transform";

export class PtvPlatformsServiceTransform<
  T extends StoppingPatternType,
> extends ServiceTransform<T> {
  transform(service: Service<T>): Service<T> {
    // TODO: Work out how this transform fetches the PTV platforms subsystem.
    // Maybe instead of taking ctx via the constructor it could just take the
    // PtvPlatformsSubsystem instance directly?
    const knownPlatforms = ctx.subsystems
      .require(PtvPlatformsSubsystem.id, PtvPlatformsSubsystem)
      .getKnownPlatforms();

    // TODO: Implement this.
    return service;
  }
}
