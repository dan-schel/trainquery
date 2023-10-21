import { type StopID, StopIDJson } from "shared/system/ids";
import { DepartureFilter } from "shared/system/timetable/departure-filter";
import { z } from "zod";
import type { Settings } from "./settings";
import { getStop } from "shared/system/config-utils";
import { isValidFilter } from "@/components/departures/helpers/available-filters";
import { getConfig } from "@/utils/get-config";

const maxPinnedWidgets = 6;

export class PinnedWidget {
  constructor(
    readonly stop: StopID,
    readonly filter: DepartureFilter,
  ) {}

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
  filter: DepartureFilter,
) {
  return settings.pinnedWidgets.some(
    (w) => w.stop == stop && w.filter.equals(filter),
  );
}

export function canPin(settings: Settings) {
  return settings.pinnedWidgets.length < maxPinnedWidgets;
}

export function togglePinnedWidget(
  settings: Settings,
  stop: StopID,
  filter: DepartureFilter,
): Settings {
  if (isPinned(settings, stop, filter)) {
    return settings.with({
      pinnedWidgets: settings.pinnedWidgets.filter(
        (w) => w.stop != stop || !w.filter.equals(filter),
      ),
    });
  } else if (canPin(settings)) {
    return settings.with({
      pinnedWidgets: [
        ...settings.pinnedWidgets,
        new PinnedWidget(stop, filter),
      ],
    });
  } else {
    // Cannot pin, you've already reached the limit.
    return settings;
  }
}

export function validatePinnedWidgetsAgainstConfig(
  pinnedWidgets: PinnedWidget[],
  logger: (msg: string) => void,
) {
  const okFilters = pinnedWidgets.filter(
    (w) =>
      getStop(getConfig(), w.stop) != null && isValidFilter(w.filter, w.stop),
  );
  if (okFilters.length < pinnedWidgets.length) {
    const removed = pinnedWidgets.length - okFilters.length;
    logger(
      `${removed} ${
        removed == 1 ? "pinned widget was" : "pinned widgets were"
      } removed due to config updates.`,
    );
  }
  return okFilters;
}
