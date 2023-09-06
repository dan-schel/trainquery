import { QUtcDateTime } from "../../qtime/qdatetime";
import { type ConfidenceLevel } from "../enums";
import {
  type DirectionID,
  type RouteVariantID,
  type LineID,
  type StaticServiceID,
  type PlatformID,
  type StopID,
} from "../ids";

export interface IServiceBase {
  readonly lines: LineID[];
  readonly route: RouteVariantID;
  readonly direction: DirectionID;
  readonly staticID: StaticServiceID | null;
  readonly sources: {
    source: string;
    id: string;
  }[];
}
export interface IServiceStop {
  readonly scheduledTime: QUtcDateTime;
  readonly liveTime: QUtcDateTime | null;
  readonly platform: {
    id: PlatformID;
    confidence: ConfidenceLevel;
  } | null;
  readonly setsDown: boolean;
  readonly picksUp: boolean;
}

export class Service implements IServiceBase {
  constructor(
    readonly lines: LineID[],
    readonly route: RouteVariantID,
    readonly direction: DirectionID,
    readonly stops: (IServiceStop | null)[],
    readonly continuation: Service | null,
    readonly staticID: StaticServiceID | null,
    readonly sources: {
      source: string;
      id: string;
    }[]
  ) {}
}

export class Departure implements IServiceStop {
  constructor(
    readonly scheduledTime: QUtcDateTime,
    readonly liveTime: QUtcDateTime | null,
    readonly platform: {
      id: PlatformID;
      confidence: ConfidenceLevel;
    } | null,
    readonly setsDown: boolean,
    readonly picksUp: boolean,

    readonly terminus: StopID,

    readonly lines: LineID[],
    readonly route: RouteVariantID,
    readonly direction: DirectionID,
    readonly stops: (IServiceStop | null)[] | null,
    readonly continuation: DepartureContinuation | null,
    readonly staticID: StaticServiceID | null,
    readonly sources: {
      source: string;
      id: string;
    }[]
  ) {}
}

export class DepartureContinuation implements IServiceBase {
  constructor(
    readonly lines: LineID[],
    readonly route: RouteVariantID,
    readonly direction: DirectionID,
    readonly stops: (IServiceStop | null)[] | null,
    readonly continuation: DepartureContinuation | null,
    readonly staticID: StaticServiceID | null,
    readonly sources: {
      source: string;
      id: string;
    }[]
  ) {}
}

export class ServiceStop implements IServiceStop {
  constructor(
    readonly scheduledTime: QUtcDateTime,
    readonly liveTime: QUtcDateTime | null,
    readonly platform: {
      id: PlatformID;
      confidence: ConfidenceLevel;
    } | null,
    readonly setsDown: boolean,
    readonly picksUp: boolean
  ) {}
}
