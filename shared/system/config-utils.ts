import type { Stop } from "./stop";
import { type LineID, type StopID, isLineID, isStopID } from "./ids";
import { parseIntNull } from "@schel-d/js-utils";
import type { Line } from "./line";
import { SharedConfig } from "./config-elements";

type HasSharedConfig = { shared: SharedConfig };

export function linesThatStopAt(config: HasSharedConfig, stop: StopID) {
  return config.shared.lines.filter((l) => l.route.stopsAt(stop));
}

export function getLine(config: HasSharedConfig, line: LineID) {
  return config.shared.lines.find((l) => l.id == line) ?? null;
}

export function requireLine(config: HasSharedConfig, line: LineID) {
  const lineData = getLine(config, line);
  if (lineData == null) {
    throw new Error(`No line with ID "${line}".`);
  }
  return lineData;
}

export function getStop(config: HasSharedConfig, stop: StopID) {
  return config.shared.stops.find((s) => s.id == stop) ?? null;
}

export function requireStop(config: HasSharedConfig, stop: StopID) {
  const stopData = getStop(config, stop);
  if (stopData == null) {
    throw new Error(`No stop with ID "${stop}".`);
  }
  return stopData;
}

export function parseLineID(value: string): LineID | null {
  const num = parseIntNull(value);
  if (num == null || !isLineID(num)) {
    return null;
  }
  return num;
}

export function requireLineID(value: string): LineID {
  const lineID = parseLineID(value);
  if (lineID == null) {
    throw new Error(`"${value}" cannot be used as a line ID.`);
  }
  return lineID;
}

export function parseStopID(value: string): StopID | null {
  const num = parseIntNull(value);
  if (num == null || !isStopID(num)) {
    return null;
  }
  return num;
}

export function requireStopID(value: string): StopID {
  const stopID = parseStopID(value);
  if (stopID == null) {
    throw new Error(`"${value}" cannot be used as a stop ID.`);
  }
  return stopID;
}

export function getStopUrlName(
  config: HasSharedConfig,
  stop: StopID
): string | null {
  return config.shared.urlNames.stops.get(stop) ?? null;
}

export function getLineUrlName(
  config: HasSharedConfig,
  line: LineID
): string | null {
  return config.shared.urlNames.lines.get(line) ?? null;
}

export function getStopFromUrlName(
  config: HasSharedConfig,
  param: string
): Stop | null {
  const urlNameMatch = config.shared.stops.find(
    (s) => config.shared.urlNames.stops.get(s.id) == param
  );
  if (urlNameMatch != null) {
    return urlNameMatch;
  }

  return config.shared.stops.find((s) => s.id.toFixed() == param) ?? null;
}

export function requireStopFromUrlName(
  config: HasSharedConfig,
  param: string
): Stop {
  const stop = getStopFromUrlName(config, param);
  if (stop == null) {
    throw new Error(`No stop matching ID or url name "${param}".`);
  }
  return stop;
}

export function getLineFromUrlName(
  config: HasSharedConfig,
  param: string
): Line | null {
  const urlNameMatch = config.shared.lines.find(
    (l) => config.shared.urlNames.lines.get(l.id) == param
  );
  if (urlNameMatch != null) {
    return urlNameMatch;
  }

  return config.shared.lines.find((l) => l.id.toFixed() == param) ?? null;
}

export function requireLineFromUrlName(
  config: HasSharedConfig,
  param: string
): Line {
  const line = getLineFromUrlName(config, param);
  if (line == null) {
    throw new Error(`No line matching ID or url name "${param}".`);
  }
  return line;
}

/** E.g. "/stops/pakenham" or "/stops/20". */
export function getStopPageRoute(config: HasSharedConfig, stop: Stop): string {
  return `/stops/${getStopUrlName(config, stop.id) ?? stop.id.toFixed()}`;
}

/** E.g. "/lines/pakenham" or "/lines/20". */
export function getLinePageRoute(config: HasSharedConfig, line: Line): string {
  return `/lines/${getLineUrlName(config, line.id) ?? line.id.toFixed()}`;
}
