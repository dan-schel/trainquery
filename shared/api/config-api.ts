import { z } from "zod";
import { api } from "./api-definition";
import { FrontendConfig } from "../system/config/frontend-config";

export const configApi = api({
  endpoint: "config",
  requiredRole: null,
  checkConfigHash: false,

  paramsSchema: z.null(),
  resultSchema: FrontendConfig.json,

  paramsSerializer: (_params) => null,
  resultSerializer: (result) => result.toJSON(),
});
