import { z } from "zod";
import { PinnedWidget } from "../pinned-widgets";
import { SignificantStop } from "../significant-stops";
import type { anySettingsVersion } from "./any";
import { parseSettingsV1 } from "./v1";

export const settingsV2 = z.object({
  // Note that theme is not stored here. It is a separate localStorage entry so
  // a lightweight script can load it fast.
  version: z.literal("v2"),
  pinnedWidgets: PinnedWidget.json.array(),
  significantStops: SignificantStop.json.array(),
  enableContinuations: z.boolean(),
  limitMapFPS: z.boolean(),

  // This was a breaking change when it was made, but if implemented like
  // showAdminDashboard below, it wouldn't have needed a new version.
  developerMode: z.boolean(),

  // The default value can be removed for v3, since parseOrMigrateToSettingsV2
  // will always return a value for it. Even when the settings was v2 and didn't
  // contain it, using default() here means zod will fill it!
  showAdminDashboardShortcut: z.boolean().default(false),
});

export function parseOrMigrateToSettingsV2(
  settings: z.input<typeof anySettingsVersion>,
): z.infer<typeof settingsV2> {
  if (settings.version === "v2") {
    return settingsV2.parse(settings);
  } else {
    // For v3 this would call parseOrMigrateToSettingsV2, which as we can see
    // here then calls parseSettingsV1 if it needs to. It's like recursion!
    const oldSettings = parseSettingsV1(settings);

    return {
      version: "v2",
      pinnedWidgets: oldSettings.pinnedWidgets,
      significantStops: oldSettings.significantStops,
      enableContinuations: oldSettings.enableContinuations,
      limitMapFPS: oldSettings.limitMapFPS,
      developerMode: false,
      showAdminDashboardShortcut: false,
    };
  }
}
