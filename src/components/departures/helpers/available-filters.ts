import { formatDirection } from "@/utils/format-filter";
import { getConfig } from "@/utils/get-config";
import { unique } from "@dan-schel/js-utils";
import { linesThatStopAt, requireStop } from "shared/system/config-utils";
import type {
  DirectionID,
  LineID,
  PlatformID,
  StopID,
} from "shared/system/ids";
import type { DepartureFilter } from "shared/system/timetable/departure-filter";

export type AvailableFilters = {
  lines:
    | {
        displayName: string;
        line: LineID;
      }[]
    | null;

  directions:
    | {
        displayName: string;
        direction: DirectionID;
      }[]
    | null;

  platforms:
    | {
        displayName: string;
        platform: PlatformID;
      }[]
    | null;
};

export function getAvailableFilters(stop: StopID): AvailableFilters {
  const lines = linesThatStopAt(getConfig(), stop, {
    sortAlphabetically: true,
  });

  const lineFilters =
    lines.length < 2
      ? null
      : lines.map((l) => ({
          displayName: l.name,
          line: l.id,
        }));

  const directions = unique(
    lines.map((l) => l.route.getPossibleDirections()).flat(),
    (a, b) => a === b,
  );
  const directionFilters =
    directions.length < 2
      ? null
      : directions.map((d) => ({
          displayName: formatDirection(d, { capital: true }),
          direction: d,
        }));

  const platforms = requireStop(getConfig(), stop).platforms;
  const platformFilters =
    platforms.length < 2
      ? null
      : platforms.map((p) => ({
          displayName: p.name,
          platform: p.id,
        }));

  return {
    lines: lineFilters,
    directions: directionFilters,
    platforms: platformFilters,
  };
}

export function isFilterSelected(
  option:
    | { line: LineID }
    | { direction: DirectionID }
    | { platform: PlatformID },
  current: DepartureFilter,
) {
  if ("line" in option) {
    return current.lines != null && current.lines.includes(option.line);
  }
  if ("direction" in option) {
    return (
      current.directions != null &&
      current.directions.includes(option.direction)
    );
  }
  if ("platform" in option) {
    return (
      current.platforms != null && current.platforms.includes(option.platform)
    );
  }
  return false;
}

export function toggleFilter(
  option:
    | { line: LineID }
    | { direction: DirectionID }
    | { platform: PlatformID },
  current: DepartureFilter,
  available: AvailableFilters,
): DepartureFilter {
  if ("line" in option) {
    if (current.lines != null && current.lines.includes(option.line)) {
      const removed = current.lines.filter((l) => l !== option.line);
      return current.with({ lines: removed.length === 0 ? null : removed });
    } else {
      let list = current.lines ?? [];
      if (list.length === (available.lines?.length ?? 0) - 1) {
        list = [];
      }
      return current.with({ lines: [...list, option.line] });
    }
  }
  if ("direction" in option) {
    if (
      current.directions != null &&
      current.directions.includes(option.direction)
    ) {
      const removed = current.directions.filter((l) => l !== option.direction);
      return current.with({
        directions: removed.length === 0 ? null : removed,
      });
    } else {
      let list = current.directions ?? [];
      if (list.length === (available.directions?.length ?? 0) - 1) {
        list = [];
      }
      return current.with({ directions: [...list, option.direction] });
    }
  }
  if ("platform" in option) {
    if (
      current.platforms != null &&
      current.platforms.includes(option.platform)
    ) {
      const removed = current.platforms.filter((l) => l !== option.platform);
      return current.with({ platforms: removed.length === 0 ? null : removed });
    } else {
      let list = current.platforms ?? [];
      if (list.length === (available.platforms?.length ?? 0) - 1) {
        list = [];
      }
      return current.with({ platforms: [...list, option.platform] });
    }
  }
  return current;
}

export function isValidFilter(filter: DepartureFilter, stop: StopID) {
  const { lines, directions, platforms } = getAvailableFilters(stop);
  if (filter.lines != null) {
    if (lines == null) {
      return false;
    }
    if (filter.lines.some((l) => lines.every((a) => a.line !== l))) {
      return false;
    }
  }
  if (filter.directions != null) {
    if (directions == null) {
      return false;
    }
    if (
      filter.directions.some((l) => directions.every((a) => a.direction !== l))
    ) {
      return false;
    }
  }
  if (filter.platforms != null) {
    if (platforms == null) {
      return false;
    }
    if (
      filter.platforms.some((l) => platforms.every((a) => a.platform !== l))
    ) {
      return false;
    }
  }
  return true;
}
