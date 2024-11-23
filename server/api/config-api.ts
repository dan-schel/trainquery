import { handle } from "./api-handler";
import { configApi } from "../../shared/api/config-api";

export const configApiHandler = handle(configApi, async (ctx) => {
  return ctx.getConfig().forFrontend();
});
