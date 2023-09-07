import { type LineID, type RouteVariantID, type DirectionID, type StaticServiceID } from "../ids";
import { Service, type CompleteStoppingPattern, type PartialStoppingPattern, type ServiceSource } from "./service";
import { ServiceStop } from "./service-stop";

export class Departure extends Service {
  constructor(
    line: LineID,
    associatedLines: LineID[],
    route: RouteVariantID,
    direction: DirectionID,
    stops: CompleteStoppingPattern | PartialStoppingPattern,
    staticID: StaticServiceID | null,
    sources: ServiceSource[],
    continuation: Service | null,
    readonly perspective: ServiceStop,
  ) {
    super(line, associatedLines, route, direction, stops, staticID, sources, continuation);
  }
}
