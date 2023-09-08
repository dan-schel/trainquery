import { z } from "zod";
import {
  type DirectionID,
  type RouteVariantID,
  type LineID,
  type StaticServiceID,
  LineIDJson,
  RouteVariantIDJson,
  DirectionIDJson,
  StaticServiceIDJson,
} from "../ids";
import {
  CompleteStoppingPattern,
  PartialStoppingPattern,
} from "./stopping-pattern";

export type ServiceSource = {
  /** Unique identifies which source this service came from. */
  source: string;
  /** The identifier given to this service by the source. */
  id: string;
};

export const BaseServiceJson = z.object({
  line: LineIDJson,
  associatedLines: LineIDJson.array(),
  route: RouteVariantIDJson,
  direction: DirectionIDJson,
  stoppingPattern: z.union([
    CompleteStoppingPattern.json,
    PartialStoppingPattern.json,
  ]),
  staticID: StaticServiceIDJson.nullable(),
  sources: z
    .object({
      source: z.string(),
      id: z.string(),
    })
    .array(),
});

type Input = z.input<typeof BaseServiceJson> & {
  continuation: Input | null;
};
type Output = z.output<typeof BaseServiceJson> & {
  continuation: Output | null;
};

export class Service {
  constructor(
    readonly line: LineID,
    readonly associatedLines: LineID[],
    readonly route: RouteVariantID,
    readonly direction: DirectionID,
    readonly stoppingPattern: CompleteStoppingPattern | PartialStoppingPattern,
    readonly staticID: StaticServiceID | null,
    readonly sources: ServiceSource[],
    readonly continuation: Service | null
  ) {}

  static readonly json: z.ZodType<Output, z.ZodTypeDef, Input> =
    BaseServiceJson.extend({
      continuation: z.lazy(() => Service.json.nullable()),
    }).transform((y) => Service.transform(y));

  static transform(x: Output): Service {
    return new Service(
      x.line,
      x.associatedLines,
      x.route,
      x.direction,
      x.stoppingPattern,
      x.staticID,
      x.sources,
      x.continuation == null ? null : Service.transform(x.continuation)
    );
  }

  toJSON(): z.input<typeof Service.json> {
    return {
      line: this.line,
      associatedLines: this.associatedLines,
      route: this.route,
      direction: this.direction,
      stoppingPattern: this.stoppingPattern.toJSON(),
      staticID: this.staticID ?? null,
      sources: this.sources,
      continuation: this.continuation?.toJSON() ?? null,
    };
  }
}
