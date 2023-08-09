import type { StopID } from "shared/system/ids";
import { getConfig } from "./cached-config";

export function linesThatStopAt(stop: StopID) {
  return getConfig().shared.lines.filter(l => l.route.stopsAt(stop));
}
