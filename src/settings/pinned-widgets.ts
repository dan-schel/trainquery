import { type StopID, StopIDJson } from "shared/system/ids";
import { DepartureFilter } from "shared/system/timetable/departure-filter";
import { z } from "zod";
import type { Settings } from "./settings";

export class PinnedWidget {
  constructor(readonly stop: StopID, readonly filter: DepartureFilter) {}

  static readonly json = z
    .object({
      // The "as any" is there to stop a weird error... I tried!
      stop: StopIDJson as any,
      filter: DepartureFilter.json,
    })
    .transform((x) => new PinnedWidget(x.stop, x.filter));

  toJSON(): z.input<typeof PinnedWidget.json> {
    return {
      stop: this.stop,
      filter: this.filter.toJSON(),
    };
  }
}

export function isPinned(
  settings: Settings,
  stop: StopID,
  filter: DepartureFilter
) {
  return settings.pinnedWidgets.some(
    (w) => w.stop == stop && w.filter.equals(filter)
  );
}

export function togglePinnedWidget(
  settings: Settings,
  updateSettings: (newSettings: Settings) => void,
  stop: StopID,
  filter: DepartureFilter
) {
  if (isPinned(settings, stop, filter)) {
    updateSettings(
      settings.with({
        pinnedWidgets: settings.pinnedWidgets.filter(
          (w) => w.stop != stop || !w.filter.equals(filter)
        ),
      })
    );
  } else {
    updateSettings(
      settings.with({
        pinnedWidgets: [
          ...settings.pinnedWidgets,
          new PinnedWidget(stop, filter),
        ],
      })
    );
  }
}

export class SignificantStop {
  constructor(readonly stop: StopID, readonly significance: string) {}

  static readonly json = z
    .object({
      // The "as any" is there to stop a weird error... I tried!
      stop: StopIDJson as any,
      significance: z.string(),
    })
    .transform((x) => new SignificantStop(x.stop, x.significance));

  toJSON(): z.input<typeof SignificantStop.json> {
    return {
      stop: this.stop,
      significance: this.significance,
    };
  }
}
