import { FrontendConfig } from "../../shared/system/config";

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

  if (existing != null && existing.hash == latestHash) {
    config = existing;
    return;
  }

  const res = await fetch("/api/config");
  const json = await res.json();
  config = FrontendConfig.json.parse(json);
  localStorage.setItem(lsKey, JSON.stringify(config.toJSON()));
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
