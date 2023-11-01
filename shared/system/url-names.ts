import { z } from "zod";
import {
  type LineID,
  LineIDStringJson,
  type StopID,
  StopIDStringJson,
} from "./ids";
import { mapJson } from "@schel-d/js-utils";

/** Provides the strings used for the stop and line page URLs. */
export class UrlNames {
  constructor(
    readonly stops: Map<StopID, string>,
    readonly lines: Map<LineID, string>,
  ) {}

  static readonly json = z
    .object({
      stops: mapJson(StopIDStringJson, z.string()),
      lines: mapJson(LineIDStringJson, z.string()),
    })
    .transform((x) => new UrlNames(x.stops, x.lines));

  toJSON(): z.input<typeof UrlNames.json> {
    return {
      stops: Object.fromEntries(this.stops),
      lines: Object.fromEntries(this.lines),
    };
  }
}
