import { z } from "zod";
import {
  PinnedWidget,
  validatePinnedWidgetsAgainstConfig,
} from "./pinned-widgets";
import { type InjectionKey, inject, type Ref, ref } from "vue";
import { SignificantStop } from "./significant-stops";
import { anySettingsVersion } from "./versions/any";
import { parseOrMigrateToSettingsV2, settingsV2 } from "./versions/v2";

/**
 * The latest (non-versioned) settings object. See the `./versions` folder for
 * the versioned parsing logic.
 */
export class Settings {
  constructor(
    readonly pinnedWidgets: PinnedWidget[],
    readonly significantStops: SignificantStop[],
    readonly enableContinuations: boolean,
    readonly limitMapFPS: boolean,
    readonly developerMode: boolean,
    readonly showAdminDashboardShortcut: boolean,
    readonly enableNearbyStops: boolean,
  ) {}

  static default = new Settings([], [], false, false, false, false, false);

  static parse(obj: unknown): Settings {
    const potentiallyOldSettings = anySettingsVersion.parse(obj);

    // Regardless of the version of obj, this function will migrate it to the
    // latest version (as long as it was/is valid!).
    const settings = parseOrMigrateToSettingsV2(potentiallyOldSettings);

    return new Settings(
      settings.pinnedWidgets,
      settings.significantStops,
      settings.enableContinuations,
      settings.limitMapFPS,
      settings.developerMode,
      settings.showAdminDashboardShortcut,
      settings.enableNearbyStops,
    );
  }

  toJSON(): z.input<typeof settingsV2> {
    return {
      version: "v2",
      pinnedWidgets: this.pinnedWidgets.map((p) => p.toJSON()),
      significantStops: this.significantStops.map((s) => s.toJSON()),
      enableContinuations: this.enableContinuations,
      limitMapFPS: this.limitMapFPS,
      developerMode: this.developerMode,
      showAdminDashboardShortcut: this.showAdminDashboardShortcut,
      enableNearbyStops: this.enableNearbyStops,
    };
  }

  with({
    pinnedWidgets,
    significantStops,
    enableContinuations,
    limitMapFPS,
    developerMode,
    showAdminDashboardShortcut,
    enableNearbyStops,
  }: {
    pinnedWidgets?: PinnedWidget[];
    significantStops?: SignificantStop[];
    enableContinuations?: boolean;
    limitMapFPS?: boolean;
    developerMode?: boolean;
    showAdminDashboardShortcut?: boolean;
    enableNearbyStops?: boolean;
  }) {
    return new Settings(
      pinnedWidgets ?? this.pinnedWidgets,
      significantStops ?? this.significantStops,
      enableContinuations ?? this.enableContinuations,
      limitMapFPS ?? this.limitMapFPS,
      developerMode ?? this.developerMode,
      showAdminDashboardShortcut ?? this.showAdminDashboardShortcut,
      enableNearbyStops ?? this.enableNearbyStops,
    );
  }

  validateAgainstConfig(logger: (msg: string) => void) {
    return this.with({
      pinnedWidgets: validatePinnedWidgetsAgainstConfig(
        this.pinnedWidgets,
        logger,
      ),
    });
  }
}

export const settingsInjectionKey = Symbol() as InjectionKey<{
  settings: Ref<Settings | null>;
  updateSettings: (newSettings: Settings) => void;
}>;

export function useSettings() {
  return inject(settingsInjectionKey, {
    settings: ref(null),
    updateSettings: () => {
      throw new Error("Update settings not injected correctly.");
    },
  });
}
