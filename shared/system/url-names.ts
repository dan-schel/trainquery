import { z } from "zod";
import {
  type LineID,
  LineIDStringJson,
  type StopID,
  StopIDStringJson,
} from "./ids";
import { mapJson } from "../utils";

/** Provides the strings used for the stop and line page URLs. */
export class UrlNames {
  constructor(
    readonly lines: Map<LineID, string>,
    readonly stops: Map<StopID, string>,
  ) {}

  static readonly json = z
    .object({
      lines: mapJson(LineIDStringJson, z.string()),
      stops: mapJson(StopIDStringJson, z.string()),
    })
    .transform((x) => new UrlNames(x.lines, x.stops));

  toJSON(): z.input<typeof UrlNames.json> {
    return {
      lines: Object.fromEntries(this.lines),
      stops: Object.fromEntries(this.stops),
    };
  }
}
