import { z } from "zod";
import { PerRouteStop, PerPossibleStop } from "./per-stop";
import { StopList, StopListID } from "./stop-list";

export class PerRouteStopSerializer<T> {
  readonly schema = z.object({
    stopList: StopListID.json,
    data: this.dataSerializer.schema.array(),
  });

  constructor(
    readonly dataSerializer: Serializer<T>,
    readonly stopListResolver: StopListResolver,
  ) {}

  toJSON(input: PerRouteStop<T>) {
    return {
      stopList: input.stopList.id.toJSON(),
      data: input.data.map(this.dataSerializer.toJSON),
    };
  }

  parse(input: unknown): PerRouteStop<T> | null {
    const parsed = this.schema.parse(input);

    const stopList = this.stopListResolver(parsed.stopList);
    if (stopList == null) {
      return null;
    }

    return new PerRouteStop(stopList, parsed.data);
  }
}

export class PerPossibleStopSerializer<T> {
  readonly schema = z.object({
    stopList: StopListID.json,
    data: this.dataSerializer.schema.array(),
  });

  constructor(
    readonly dataSerializer: Serializer<T>,
    readonly stopListResolver: StopListResolver,
  ) {}

  toJSON(input: PerPossibleStop<T>) {
    return {
      stopList: input.stopList.id.toJSON(),
      data: input.data.map(this.dataSerializer.toJSON),
    };
  }

  parse(input: unknown): PerPossibleStop<T> | null {
    const parsed = this.schema.parse(input);

    const stopList = this.stopListResolver(parsed.stopList);
    if (stopList == null) {
      return null;
    }

    return new PerPossibleStop(stopList, parsed.data);
  }
}

export type StopListResolver = (id: StopListID) => StopList | null;

export type Serializer<T> = {
  readonly schema: z.ZodType<T>;
  toJSON: (data: T) => z.input<z.ZodType<T>>;
};
