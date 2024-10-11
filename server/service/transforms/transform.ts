import {
  Service,
  StoppingPatternType,
} from "../../../shared/system/service/service";

export abstract class ServiceTransform<T extends StoppingPatternType> {
  abstract transform(service: Service<T>): Service<T>;
}
