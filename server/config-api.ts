import { ServerConfig } from "../shared/system/config";

export async function configApi(config: ServerConfig) {
  return config.forFrontend().toJSON();
}
