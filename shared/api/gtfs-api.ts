import { z } from "zod";
import { api } from "./api-definition";
import { StopIDJson } from "../system/ids";

export const gtfsApi = api({
  endpoint: "admin/gtfs",
  requiredRole: "superadmin",
  checkConfigHash: true,

  paramsSchema: z.null(),
  resultSchema: z.union([
    z.object({
      hasData: z.literal(true),
      unsupportedGtfsStopIDs: z.number().array(),
      unsupportedRoutes: StopIDJson.array().array(),
    }),
    z.object({
      hasData: z.literal(false),
    }),
  ]),

  paramsSerializer: (_params) => null,
  resultSerializer: (result) => result,
});
