import { listifyAnd, nonNull } from "@schel-d/js-utils";
import type { DirectionID, StopID } from "shared/system/ids";
import type { DepartureFilter } from "shared/system/timetable/departure-filter";
import { formatMode } from "./format-mode";
import { requireLine, requirePlatform } from "shared/system/config-utils";
import { getConfig } from "./get-config";

export function formatFilter(filter: DepartureFilter, perspective: StopID) {
  // Add "Citybound" as a prefix?
  let prefix: string | null = null;
  if (filter.directions != null) {
    prefix = listifyAnd(
      filter.directions
        .map((d, i) => formatDirection(d, { capital: i == 0 }))
        .sort((a, b) => a.localeCompare(b)),
    );
  }

  // Add "Gippsland" as a prefix?
  if (filter.lines != null) {
    const linesNames = listifyAnd(
      filter.lines
        .map((l) => requireLine(getConfig(), l).name)
        .sort((a, b) => a.localeCompare(b)),
    );
    if (prefix != null) {
      prefix += " " + linesNames;
    } else {
      prefix = linesNames;
    }
  }

  // Is the noun "trains" or "regional trains"?
  let noun = prefix == null ? "Trains" : "trains";
  if (filter.serviceTypes != null) {
    noun = listifyAnd(
      filter.serviceTypes
        .map((s, i) =>
          formatMode(s, { capital: i == 0 && prefix == null, plural: true }),
        )
        .sort((a, b) => a.localeCompare(b)),
    );
  }

  // Add "on platform 1" suffix?
  let suffix = null;
  if (filter.platforms != null) {
    const numbers = listifyAnd(
      filter.platforms
        .map((p) => requirePlatform(getConfig(), perspective, p).name)
        .sort((a, b) => a.localeCompare(b)),
    );
    suffix =
      filter.platforms.length == 1
        ? `on platform ${numbers}`
        : `on platforms ${numbers}`;
  }

  // If no directions, lines, service types, or platforms are being filtered...
  if (filter.serviceTypes == null && prefix == null && suffix == null) {
    noun = "All trains";

    // Only mention arrives and set down only if there's really nothing else to
    // mention.
    if (filter.arrivals && filter.setDownOnly) {
      suffix = "(including arrivals and set down only)";
    } else if (filter.arrivals) {
      suffix = "(including arrivals)";
    } else if (filter.setDownOnly) {
      suffix = "(including set down only)";
    }
  }

  // Join the prefix, noun, and suffix together.
  return [prefix, noun, suffix].filter(nonNull).join(" ");
}

export function formatDirection(
  direction: DirectionID,
  { capital = false }: { capital?: boolean } = {},
) {
  const name = getConfig().frontend.directionNames.getName(direction, capital);
  if (name == null) {
    throw new Error(`Unnamed direction "${direction}".`);
  }
  return name;
}
