import { z } from "zod";
import { api } from "../api-definition";
import { AdminLogWindow } from "../../admin/logs";

export const logsApi = api({
  endpoint: "admin/logs",
  requiredRole: "superadmin",
  checkConfigHash: true,

  paramsSchema: z.object({
    instance: z.string().nullable(),
    beforeSequence: z.number().nullable(),
    count: z.number(),
  }),
  resultSchema: z.object({
    logWindow: AdminLogWindow.json,
    availableInstances: z.string().array(),
  }),

  paramsSerializer: (params) => params,
  resultSerializer: (result) => ({
    logWindow: result.logWindow.toJSON(),
    availableInstances: result.availableInstances,
  }),
});
