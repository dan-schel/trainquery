import {
  type DirectionID,
  type RouteVariantID,
  type LineID,
  type StaticServiceID,
} from "../ids";
import { ServiceStop } from "./service-stop";

export type ServiceSource = {
  /** Unique identifies which source this service came from. */
  source: string;
  /** The identifier given to this service by the source. */
  id: string;
};
export type CompleteStoppingPattern = {
  stops: (ServiceStop | null)[];
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
