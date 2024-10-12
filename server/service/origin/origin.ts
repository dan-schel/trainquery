import {
  Service,
  StoppingPatternType,
} from "../../../shared/system/service/service";

export abstract class ServiceOrigin<T extends StoppingPatternType> {
  abstract getService(/* Not sure what args yet. */): Promise<Service<T> | null>;
  abstract getDepartures(/* Not sure what args yet. */): Promise<Service<T>[]>;
}
