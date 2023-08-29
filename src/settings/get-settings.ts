import { Settings } from "./settings";

const lsKey = "trainquery-settings";

let settings: Settings | null = null;

export function getSettings() {
  return settings;
}

export function requireSettings() {
  if (settings == null) {
    throw new Error(
      "Settings are not available, is this code running during SSR?"
    );
  }
  return settings;
}

export function initSettings() {
  const existing = localStorage.getItem(lsKey);
  if (existing == null) {
    settings = Settings.default;
    return;
  }

  try {
    settings = Settings.json.parse(JSON.parse(existing));
  } catch {
    console.warn("Failed to parse user settings, using default settings.");
    settings = Settings.default;
  }
}

export function saveSettings(newSettings: Settings) {
  settings = newSettings;
  localStorage.setItem(lsKey, JSON.stringify(settings.toJSON()));
}
