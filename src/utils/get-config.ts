import { FrontendConfig } from "shared/system/config/frontend-config";
import { callApi } from "./call-api";
import { configApi } from "shared/api/config-api";

const lsKey = "trainquery-config";

let config: FrontendConfig | null = null;

export function getConfig() {
  if (config == null) {
    throw new Error("Call initConfig first.");
  }
  return config;
}

export async function initConfig(latestHash: string) {
  const existing = getExistingConfig();

  if (existing != null && existing.hash === latestHash) {
    config = existing;
    return;
  }

  const result = await callApi(configApi, null);

  if (result.type === "success") {
    config = result.data;
    localStorage.setItem(lsKey, JSON.stringify(config.toJSON()));
  } else if (result.type === "error") {
    throw result.error;
  }
}

export function provideConfig(ssrConfig: FrontendConfig) {
  config = ssrConfig;
}

function getExistingConfig(): FrontendConfig | null {
  const existing = localStorage.getItem(lsKey);
  if (existing == null) {
    return null;
  }

  try {
    return FrontendConfig.json.parse(JSON.parse(existing));
  } catch {
    return null;
  }
}
