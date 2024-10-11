import {
  type DirectionID,
  type RouteVariantID,
  type LineID,
  type StaticServiceID,
} from "../ids";
import { CompletePattern } from "./complete-pattern";
import { Continuation } from "./continuation";
import { KnownOriginPattern } from "./known-origin-pattern";
import { KnownPerspectivePattern } from "./known-perspective-pattern";

export type ServiceSource = {
  /** Unique identifies which source this service came from. */
  source: string;
  /** The identifier given to this service by the source. */
  id: string;
};

export type StoppingPatternType =
  | CompletePattern
  | KnownOriginPattern
  | KnownPerspectivePattern;

export class Service<
  Pattern extends StoppingPatternType = StoppingPatternType,
> {
  constructor(
    readonly line: LineID,
    readonly associatedLines: LineID[],
    readonly route: RouteVariantID,
    readonly direction: DirectionID,
    readonly pattern: Pattern,
    readonly staticID: StaticServiceID | null,
    readonly sources: ServiceSource[],
    readonly continuation: Continuation | null,
    readonly debugInfo: Record<string, string>,
  ) {}
}
