import { z } from "zod";
import {
  type LineID,
  type RouteVariantID,
  type DirectionID,
  type StaticServiceID,
  DirectionIDJson,
  LineIDJson,
  RouteVariantIDJson,
  StaticServiceIDJson,
  type StopID,
} from "../ids";
import { CompletePattern } from "./complete-pattern";
import { Continuation } from "./continuation";
import { KnownPerspectivePattern } from "./known-perspective-pattern";
import { Service, type ServiceSource } from "./service";
import { ServedStop } from "./served-stop";

export class Departure extends Service<
  CompletePattern | KnownPerspectivePattern
> {
  constructor(
    line: LineID,
    associatedLines: LineID[],
    route: RouteVariantID,
    direction: DirectionID,
    pattern: CompletePattern | KnownPerspectivePattern,
    staticID: StaticServiceID | null,
    sources: ServiceSource[],
    continuation: Continuation | null,
    debugInfo: Record<string, string>,
    readonly perspectiveIndex: number,
  ) {
    super(
      line,
      associatedLines,
      route,
      direction,
      pattern,
      staticID,
      sources,
      continuation,
      debugInfo,
    );
  }

  static readonly json = z
    .object({
      line: LineIDJson,
      associatedLines: LineIDJson.array(),
      route: RouteVariantIDJson,
      direction: DirectionIDJson,
      pattern: z.union([CompletePattern.json, KnownPerspectivePattern.json]),
      staticID: StaticServiceIDJson.nullable(),
      sources: z
        .object({
          source: z.string(),
          id: z.string(),
        })
        .array(),
      continuation: Continuation.json.nullable(),
      debugInfo: z.record(z.string()),
      perspectiveIndex: z.number(),
    })
    .transform(
      (x) =>
        new Departure(
          x.line,
          x.associatedLines,
          x.route,
          x.direction,
          x.pattern,
          x.staticID,
          x.sources,
          x.continuation,
          x.debugInfo,
          x.perspectiveIndex,
        ),
    );

  toJSON(): z.input<typeof Departure.json> {
    return {
      line: this.line,
      associatedLines: this.associatedLines,
      route: this.route,
      direction: this.direction,
      pattern: this.pattern.toJSON(),
      staticID: this.staticID,
      sources: this.sources,
      continuation: this.continuation?.toJSON() ?? null,
      debugInfo: this.debugInfo,
      perspectiveIndex: this.perspectiveIndex,
    };
  }

  get perspective(): ServedStop {
    if (this.pattern instanceof CompletePattern) {
      return this.pattern.requireServedStop(this.perspectiveIndex);
    } else {
      return this.pattern.perspective;
    }
  }

  get terminus():
    | ServedStop
    | {
        stop: StopID;
        stopListIndex: number;
      } {
    return this.pattern.terminus;
  }

  getServiceString(): Service[] {
    const result: Service[] = [];

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: Service | null = this;
    while (current != null) {
      result.push(current);
      current = current.continuation;
    }

    return result;
  }

  isArrival() {
    return this.perspectiveIndex === this.pattern.terminus.stopListIndex;
  }

  static fromService<T extends CompletePattern | KnownPerspectivePattern>(
    service: Service<T>,
    perspectiveIndex: number,
  ) {
    return new Departure(
      service.line,
      service.associatedLines,
      service.route,
      service.direction,
      service.pattern,
      service.staticID,
      service.sources,
      service.continuation,
      service.debugInfo,
      perspectiveIndex,
    );
  }
}
