import { z } from "zod";
import {
  LineID,
  LineIDJson,
  StopID,
  StopIDJson,
} from "../../shared/system/ids";
import { IntStringJson, mapJson } from "../../shared/utils";

export class PtvConfig {
  constructor(
    readonly disruptionsRelayUrl: string,
    readonly lines: Map<number, LineID>,
    readonly stops: Map<number, StopID>,
  ) {}

  static readonly json = z
    .object({
      disruptionsRelayUrl: z.string(),
      lines: mapJson(IntStringJson, LineIDJson),
      stops: mapJson(IntStringJson, StopIDJson),
    })
    .transform((x) => new PtvConfig(x.disruptionsRelayUrl, x.lines, x.stops));

  toJSON(): z.input<typeof PtvConfig.json> {
    return {
      disruptionsRelayUrl: this.disruptionsRelayUrl,
      lines: Object.fromEntries(this.lines),
      stops: Object.fromEntries(this.stops),
    };
  }
}
