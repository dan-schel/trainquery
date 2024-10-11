import {
  Service,
  StoppingPatternType,
} from "../../../../shared/system/service/service";
import { ServiceTransform } from "../transform";

export class PtvPlatformsServiceTransform<
  T extends StoppingPatternType,
> extends ServiceTransform<T> {
  transform(service: Service<T>): Service<T> {
    // TODO: Implement this.
    return service;
  }
}
