import { StoppingPatternType } from "../../shared/system/service/service";
import { ServiceOrigin } from "./origin/origin";
import { ServiceTransform } from "./transforms/transform";

export class ServiceFetcher<T extends StoppingPatternType> {
  constructor(
    readonly origin: ServiceOrigin<T>,
    // This might cause problems if it only allows exactly T.
    // My intention here is that a transform that extends
    // ServiceTransform<CompletePattern | KnownOriginPattern> should be able to
    // work with a ServiceOrigin<CompletePattern> or
    // ServiceOrigin<KnownOriginPattern>.
    readonly transforms: ServiceTransform<T>[],
  ) {}
}
