import { QUtcDateTime } from "../../qtime/qdatetime";
import { type ConfidenceLevel } from "../enums";
import {
  type DirectionID,
  type RouteVariantID,
  type LineID,
  type StaticServiceID,
  type PlatformID,
} from "../ids";

export type ServiceSource = {
  /** Unique identifies which source this service came from. */
  source: string;
  /** The identifier given to this service by the source. */
  id: string;
};
export type CompleteStoppingPattern = {
  stop: (ServiceStop | null)[];
};
export type PartialStoppingPattern = {
  /** The index of the terminus within the stop list for this variant/direction. */
  terminusIndex: number;
};

export class Service {
  constructor(
    readonly line: LineID,
    readonly associatedLines: LineID[],
    readonly route: RouteVariantID,
    readonly direction: DirectionID,
    readonly stops: CompleteStoppingPattern | PartialStoppingPattern,
    readonly staticID: StaticServiceID | null,
    readonly sources: ServiceSource[],
    readonly continuation: Service | null
  ) { }
}

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

export class ServiceStop {
  constructor(
    readonly scheduledTime: QUtcDateTime,
    readonly liveTime: QUtcDateTime | null,
    readonly setsDown: boolean,
    readonly picksUp: boolean,
    readonly platform: {
      id: PlatformID,
      confidence: ConfidenceLevel
    } | null
  ) { }
}
