import { z } from "zod";
import {
  type LineID,
  type RouteVariantID,
  type DirectionID,
  type StaticServiceID,
  LineIDJson,
  RouteVariantIDJson,
  DirectionIDJson,
  StaticServiceIDJson,
  type StopID,
} from "../ids";
import { CompletePattern } from "./complete-pattern";
import { KnownOriginPattern } from "./known-origin-pattern";
import { Service, type ServiceSource } from "./service";
import { ServedStop } from "./served-stop";

const nonRecursiveJson = z.object({
  line: LineIDJson,
  associatedLines: LineIDJson.array(),
  route: RouteVariantIDJson,
  direction: DirectionIDJson,
  staticID: StaticServiceIDJson.nullable(),
  sources: z
    .object({
      source: z.string(),
      id: z.string(),
    })
    .array(),
  pattern: z.union([CompletePattern.json, KnownOriginPattern.json]),
});

const rawJson: z.ZodType<Output, z.ZodTypeDef, Input> = nonRecursiveJson.extend(
  {
    continuation: z.lazy(() => rawJson).nullable(),
  }
);

type Input = z.input<typeof nonRecursiveJson> & {
  continuation: Input | null;
};
type Output = z.output<typeof nonRecursiveJson> & {
  continuation: Output | null;
};

export class Continuation extends Service<
  CompletePattern | KnownOriginPattern
> {
  constructor(
    line: LineID,
    associatedLines: LineID[],
    route: RouteVariantID,
    direction: DirectionID,
    pattern: CompletePattern | KnownOriginPattern,
    staticID: StaticServiceID | null,
    sources: ServiceSource[],
    continuation: Continuation | null
  ) {
    super(
      line,
      associatedLines,
      route,
      direction,
      pattern,
      staticID,
      sources,
      continuation
    );
  }

  static readonly json = rawJson.transform((x) => Continuation.transform(x));

  static transform(x: Output): Continuation {
    return new Continuation(
      x.line,
      x.associatedLines,
      x.route,
      x.direction,
      x.pattern,
      x.staticID,
      x.sources,
      x.continuation == null ? null : Continuation.transform(x.continuation)
    );
  }

  toJSON(): z.input<typeof Continuation.json> {
    return {
      line: this.line,
      associatedLines: this.associatedLines,
      route: this.route,
      direction: this.direction,
      pattern: this.pattern.toJSON(),
      staticID: this.staticID,
      sources: this.sources,
      continuation: this.continuation?.toJSON() ?? null,
    };
  }

  get origin(): ServedStop {
    return this.pattern.origin;
  }
  get terminus():
    | ServedStop
    | {
        stop: StopID;
        stopListIndex: number;
      } {
    return this.pattern.terminus;
  }
}
