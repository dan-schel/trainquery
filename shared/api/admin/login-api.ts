import { z } from "zod";
import { api } from "../api-definition";
import { Session } from "../../admin/session";

export const loginApi = api({
  endpoint: "admin/login",
  requiredRole: null,
  checkConfigHash: true,

  paramsSchema: z.object({
    username: z.string(),
    password: z.string(),
  }),
  resultSchema: Session.json.nullable(),

  paramsSerializer: (params) => params,
  resultSerializer: (result) => result?.toJSON() ?? null,
});
