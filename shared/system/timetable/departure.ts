import { z } from "zod";
import {
  type LineID,
  type RouteVariantID,
  type DirectionID,
  type StaticServiceID,
} from "../ids";
import { BaseServiceJson, Service, type ServiceSource } from "./service";
import { ServiceStop } from "./service-stop";
import {
  CompleteStoppingPattern,
  PartialStoppingPattern,
} from "./stopping-pattern";

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
    readonly perspective: ServiceStop
  ) {
    super(
      line,
      associatedLines,
      route,
      direction,
      stops,
      staticID,
      sources,
      continuation
    );
  }

  static readonly json = BaseServiceJson.extend({
    perspective: ServiceStop.json,
    continuation: Service.json.nullable(),
  }).transform(
    (y) =>
      new Departure(
        y.line,
        y.associatedLines,
        y.route,
        y.direction,
        y.stoppingPattern,
        y.staticID,
        y.sources,
        y.continuation == null ? null : Service.transform(y.continuation),
        y.perspective
      )
  );

  toJSON(): z.input<typeof Departure.json> {
    return {
      line: this.line,
      associatedLines: this.associatedLines,
      route: this.route,
      direction: this.direction,
      stoppingPattern: this.stoppingPattern.toJSON(),
      staticID: this.staticID ?? null,
      sources: this.sources,
      continuation: this.continuation?.toJSON() ?? null,
      perspective: this.perspective.toJSON(),
    };
  }
}
