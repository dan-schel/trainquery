import { z } from "zod";
import {
  LineID,
  LineIDJson,
  StopID,
  StopIDJson,
} from "../../shared/system/ids";
import { IntStringJson, mapJson } from "../../shared/utils";
import { RequestBuilder, requestBuilderJson } from "../external-data/requests";

export class PtvConfig {
  constructor(
    readonly disruptionsRelayUrl: string,
    readonly platformsApi: RequestBuilder[],
    readonly lines: Map<number, LineID>,
    readonly stops: Map<number, StopID>,
  ) {}

  static readonly json = z
    .object({
      disruptionsRelayUrl: z.string(),
      platformsApi: z
        .union([requestBuilderJson, requestBuilderJson.array()])
        .transform((x) => (Array.isArray(x) ? x : [x]))
        .default([]),
      lines: mapJson(IntStringJson, LineIDJson),
      stops: mapJson(IntStringJson, StopIDJson),
    })
    .transform(
      (x) =>
        new PtvConfig(x.disruptionsRelayUrl, x.platformsApi, x.lines, x.stops),
    );
}
