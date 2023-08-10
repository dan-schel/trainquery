import { z } from "zod";
import { LineID, LineIDStringJson, StopID, StopIDStringJson } from "./ids";

/** Provides the strings used for the stop and line page URLs. */
export class UrlNames {
  constructor(
    readonly stops: Partial<Record<StopID, string>>,
    readonly lines: Partial<Record<LineID, string>>,
  ) {
    this.stops = stops;
    this.lines = lines;
  }

  static readonly json = z.object({
    stops: z.record(StopIDStringJson, z.string()),
    lines: z.record(LineIDStringJson, z.string()),
  }).transform(x => new UrlNames(x.stops, x.lines));

  toJSON(): z.input<typeof UrlNames.json> {
    return {
      stops: this.stops as Record<StopID, string>,
      lines: this.lines as Record<StopID, string>
    };
  }
}
