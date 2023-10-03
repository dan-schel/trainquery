import { Settings } from "./settings";

const lsKey = "trainquery-settings";

export function readSettings() {
  const existing = localStorage.getItem(lsKey);
  if (existing == null) {
    return Settings.default;
  }

  try {
    return Settings.json.parse(JSON.parse(existing));
  } catch {
    console.warn("Failed to parse user settings, using default settings.");
    return Settings.default;
  }
}

export function writeSettings(newSettings: Settings) {
  localStorage.setItem(lsKey, JSON.stringify(newSettings.toJSON()));
}
