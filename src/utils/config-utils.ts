import { type LineID, type StopID, isLineID } from "../../shared/system/ids";
import { getConfig } from "./cached-config";
import { parseIntNull } from "@schel-d/js-utils";

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
    throw new Error(`"${value}" cannot be used as a :ine ID.`);
  }
  return lineID;
}
