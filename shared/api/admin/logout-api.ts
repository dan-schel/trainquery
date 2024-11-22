import { z } from "zod";
import { api } from "../api-definition";

export const logoutApi = api({
  endpoint: "admin/logout",
  requiredRole: "any",
  checkConfigHash: true,

  paramsSchema: z.null(),
  resultSchema: z.null(),

  paramsSerializer: (_params) => null,
  resultSerializer: (_result) => null,
});
