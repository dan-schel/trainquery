import { z } from "zod";
import {
  type LineID,
  LineIDStringJson,
  type StopID,
  StopIDStringJson,
} from "./ids";

/** Provides the strings used for the stop and line page URLs. */
export class UrlNames {
  constructor(
    readonly stops: Map<StopID, string>,
    readonly lines: Map<LineID, string>
  ) {}

  static readonly json = z
    .object({
      stops: z.record(StopIDStringJson, z.string()),
      lines: z.record(LineIDStringJson, z.string()),
    })
    .transform(
      (x) =>
        new UrlNames(
          new Map(
            Object.entries(x.stops).map(([stop, urlName]) => [
              StopIDStringJson.parse(stop),
              urlName!,
            ])
          ),
          new Map(
            Object.entries(x.lines).map(([line, urlName]) => [
              LineIDStringJson.parse(line),
              urlName!,
            ])
          )
        )
    );

  toJSON(): z.input<typeof UrlNames.json> {
    return {
      stops: Object.fromEntries(this.stops),
      lines: Object.fromEntries(this.lines),
    };
  }
}
