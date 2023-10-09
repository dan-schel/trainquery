import { z } from "zod";
import {
  type LineID,
  type RouteVariantID,
  type DirectionID,
  type StaticServiceID,
} from "../ids";
import { BaseServiceJson, Service, type ServiceSource } from "./service";
import { ServedStop, SkippedStop } from "./service-stop";
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
    readonly perspectiveIndex: number,
    readonly perspective: ServedStop
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
    continuation: Service.rawJson.nullable(),
    perspectiveIndex: z.number(),
    perspective: ServedStop.json,
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
        y.perspectiveIndex,
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
      perspectiveIndex: this.perspectiveIndex,
      perspective: this.perspective.toJSON(),
    };
  }

  static fromService(
    service: Service,
    perspectiveIndex: number,
    perspective: ServedStop
  ) {
    return new Departure(
      service.line,
      service.associatedLines,
      service.route,
      service.direction,
      service.stoppingPattern,
      service.staticID,
      service.sources,
      service.continuation,
      perspectiveIndex,
      perspective
    );
  }
}

/**
 * Attempts to convert a service to a departure. Returns null if the service
 * does not stop at the given perspective index or does not contain sufficient
 * information to build a departure at that perspective index.
 */
export function departurify(service: Service, perspectiveIndex: number) {
  if (service.stoppingPattern instanceof CompleteStoppingPattern) {
    const perspective = service.stoppingPattern.stops[perspectiveIndex];
    if (perspective == null || perspective instanceof SkippedStop) {
      return null;
    }
    return Departure.fromService(service, perspectiveIndex, perspective);
  } else {
    const perspective = service.stoppingPattern
      .getKnownStops()
      .find((s) => s.index == perspectiveIndex);
    if (perspective == null || perspective.detail == null) {
      return null;
    }
    return Departure.fromService(service, perspectiveIndex, perspective.detail);
  }
}

/**
 * Attempts to convert a service to a departure. Returns null if the service
 * origin is unknown, or the service does not contain sufficient information to
 * build a departure from the perspective of the origin.
 */
export function departurifyFromOrigin(service: Service) {
  if (service.stoppingPattern instanceof CompleteStoppingPattern) {
    const perspectiveIndex = service.stoppingPattern.stops.findIndex(
      (s) => s instanceof ServedStop
    );
    return departurify(service, perspectiveIndex);
  } else {
    if (service.stoppingPattern.origin?.index == null) {
      return null;
    }
    return departurify(service, service.stoppingPattern.origin.index);
  }
}
