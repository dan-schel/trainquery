import { z } from "zod";
import { PinnedWidget } from "../pinned-widgets";
import { SignificantStop } from "../significant-stops";
import type { anySettingsVersion } from "./any";

export const settingsV1 = z.object({
  // Note that theme is not stored here. It is a separate localStorage entry so
  // a lightweight script can load it fast.
  version: z.literal("v1"),
  pinnedWidgets: PinnedWidget.json.array(),
  significantStops: SignificantStop.json.array(),
  enableContinuations: z.boolean(),
  limitMapFPS: z.boolean(),
});

export function parseSettingsV1(
  settings: z.input<typeof anySettingsVersion>,
): z.infer<typeof settingsV1> {
  return settingsV1.parse(settings);
}
