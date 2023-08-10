import type { Stop } from "shared/system/stop";
import {
  type LineID,
  type StopID,
  isLineID,
  isStopID,
} from "../../shared/system/ids";
import { getConfig } from "./cached-config";
import { parseIntNull } from "@schel-d/js-utils";
import type { Line } from "shared/system/line";

export function linesThatStopAt(stop: StopID) {
  return getConfig().shared.lines.filter((l) => l.route.stopsAt(stop));
}

export function getLine(line: LineID) {
  return getConfig().shared.lines.find((l) => l.id == line) ?? null;
}

export function requireLine(line: LineID) {
  const lineData = getLine(line);
  if (lineData == null) {
    throw new Error(`No line with ID "${line}".`);
  }
  return lineData;
}

export function getStop(stop: StopID) {
  return getConfig().shared.stops.find((s) => s.id == stop) ?? null;
}

export function requireStop(stop: StopID) {
  const stopData = getStop(stop);
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

export function getStopUrlName(stop: StopID): string | null {
  return getConfig().shared.urlNames.stops[stop] ?? null;
}

export function getLineUrlName(line: LineID): string | null {
  return getConfig().shared.urlNames.lines[line] ?? null;
}

export function getStopFromUrlName(param: string): Stop | null {
  const urlNameMatch = getConfig().shared.stops.find(
    (s) => getConfig().shared.urlNames.stops[s.id] == param
  );
  if (urlNameMatch != null) {
    return urlNameMatch;
  }

  return getConfig().shared.stops.find((s) => s.id.toFixed() == param) ?? null;
}

export function requireStopFromUrlName(param: string): Stop {
  const stop = getStopFromUrlName(param);
  if (stop == null) {
    throw new Error(`No stop matching ID or url name "${param}".`);
  }
  return stop;
}

export function getLineFromUrlName(param: string): Line | null {
  const urlNameMatch = getConfig().shared.lines.find(
    (l) => getConfig().shared.urlNames.lines[l.id] == param
  );
  if (urlNameMatch != null) {
    return urlNameMatch;
  }

  return getConfig().shared.lines.find((l) => l.id.toFixed() == param) ?? null;
}

export function requireLineFromUrlName(param: string): Line {
  const line = getLineFromUrlName(param);
  if (line == null) {
    throw new Error(`No line matching ID or url name "${param}".`);
  }
  return line;
}
