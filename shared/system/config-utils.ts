import type { Stop } from "./stop";
import {
  type LineID,
  type StopID,
  isLineID,
  isStopID,
  type ServiceTypeID,
  type PlatformID,
} from "./ids";
import { parseIntNull } from "@schel-d/js-utils";
import type { Line } from "./line";
import { SharedConfig } from "./config-elements";
import { Service } from "./timetable/service";

export type HasSharedConfig = { shared: SharedConfig };

export function linesThatStopAt(
  config: HasSharedConfig,
  stop: StopID,
  {
    ignoreSpecialEventsOnlyLines = false,
    sortAlphabetically = false,
  }: {
    ignoreSpecialEventsOnlyLines?: boolean;
    sortAlphabetically?: boolean;
  } = {}
) {
  let lines = config.shared.lines.filter((l) => l.route.stopsAt(stop));
  if (
    ignoreSpecialEventsOnlyLines &&
    !lines.every((l) => l.specialEventsOnly)
  ) {
    lines = lines.filter((l) => !l.specialEventsOnly);
  }
  if (sortAlphabetically) {
    lines.sort((a, b) => a.name.localeCompare(b.name));
  }
  return lines;
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

export function getPlatform(
  config: HasSharedConfig,
  stop: StopID,
  platform: PlatformID
) {
  const stopData = getStop(config, stop);
  if (stopData == null) {
    return null;
  }
  return stopData.platforms.find((s) => s.id == platform) ?? null;
}

export function requirePlatform(
  config: HasSharedConfig,
  stop: StopID,
  platform: PlatformID
) {
  const platformData = getPlatform(config, stop, platform);
  if (platformData == null) {
    throw new Error(`No platform with ID "${platform}" at stop "${stop}".`);
  }
  return platformData;
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
export function getStopPageRoute(
  config: HasSharedConfig,
  stop: StopID
): string {
  return `/stops/${getStopUrlName(config, stop) ?? stop.toFixed()}`;
}

/** E.g. "/lines/pakenham" or "/lines/20". */
export function getLinePageRoute(
  config: HasSharedConfig,
  line: LineID
): string {
  return `/lines/${getLineUrlName(config, line) ?? line.toFixed()}`;
}

/** E.g. "/train/[something]". */
export function getServicePageRoute(
  _config: HasSharedConfig,
  service: Service
): string {
  // <TEMP>
  // Not all services have a static ID, and live data isn't captured here at all.
  return `/train/${service.staticID}`;
  // </TEMP>
}

export function getServiceType(
  config: HasSharedConfig,
  serviceType: ServiceTypeID
) {
  return config.shared.serviceTypes.find((l) => l.id == serviceType) ?? null;
}

export function requireServiceType(
  config: HasSharedConfig,
  serviceType: ServiceTypeID
) {
  const serviceTypeData = getServiceType(config, serviceType);
  if (serviceTypeData == null) {
    throw new Error(`No service type with ID "${serviceType}".`);
  }
  return serviceTypeData;
}
