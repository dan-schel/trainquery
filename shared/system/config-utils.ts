import type { Stop } from "./stop";
import {
  type LineID,
  type StopID,
  isLineID,
  isStopID,
  type ServiceTypeID,
  type PlatformID,
} from "./ids";
import { parseIntNull } from "@dan-schel/js-utils";
import type { Line } from "./line";
import { Service } from "./service/service";
import { SharedConfig } from "./config/shared-config";
import { DepartureFilter } from "./timetable/departure-filter";
import { QLocalDateTime } from "../qtime/qdatetime";
import {
  HookContinuationGroup,
  LinearContinuationGroup,
} from "./continuation-group";

export type HasSharedConfig = { shared: SharedConfig };

export function linesThatStopAt(
  config: HasSharedConfig,
  stop: StopID,
  {
    ignoreInvisibleLines = false,
    sortAlphabetically = false,
  }: {
    ignoreInvisibleLines?: boolean;
    sortAlphabetically?: boolean;
  } = {},
) {
  let lines = config.shared.lines.filter((l) => l.route.stopsAt(stop));
  if (ignoreInvisibleLines && !lines.every((l) => l.visibility !== "regular")) {
    lines = lines.filter((l) => l.visibility === "regular");
  }
  if (sortAlphabetically) {
    lines.sort((a, b) => a.name.localeCompare(b.name));
  }
  return lines;
}

export function getLine(config: HasSharedConfig, line: LineID) {
  return config.shared.lines.find((l) => l.id === line) ?? null;
}

export function requireLine(config: HasSharedConfig, line: LineID) {
  const lineData = getLine(config, line);
  if (lineData == null) {
    throw new Error(`No line with ID "${line}".`);
  }
  return lineData;
}

export function getStop(config: HasSharedConfig, stop: StopID) {
  return config.shared.stops.find((s) => s.id === stop) ?? null;
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
  platform: PlatformID,
) {
  const stopData = getStop(config, stop);
  if (stopData == null) {
    return null;
  }
  return stopData.platforms.find((s) => s.id === platform) ?? null;
}

export function requirePlatform(
  config: HasSharedConfig,
  stop: StopID,
  platform: PlatformID,
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
  stop: StopID,
): string | null {
  return config.shared.urlNames.stops.get(stop) ?? null;
}

export function getLineUrlName(
  config: HasSharedConfig,
  line: LineID,
): string | null {
  return config.shared.urlNames.lines.get(line) ?? null;
}

export function getStopFromUrlName(
  config: HasSharedConfig,
  param: string,
): Stop | null {
  const urlNameMatch = config.shared.stops.find(
    (s) => config.shared.urlNames.stops.get(s.id) === param,
  );
  if (urlNameMatch != null) {
    return urlNameMatch;
  }

  return config.shared.stops.find((s) => s.id.toFixed() === param) ?? null;
}

export function requireStopFromUrlName(
  config: HasSharedConfig,
  param: string,
): Stop {
  const stop = getStopFromUrlName(config, param);
  if (stop == null) {
    throw new Error(`No stop matching ID or url name "${param}".`);
  }
  return stop;
}

export function getLineFromUrlName(
  config: HasSharedConfig,
  param: string,
): Line | null {
  const urlNameMatch = config.shared.lines.find(
    (l) => config.shared.urlNames.lines.get(l.id) === param,
  );
  if (urlNameMatch != null) {
    return urlNameMatch;
  }

  return config.shared.lines.find((l) => l.id.toFixed() === param) ?? null;
}

export function requireLineFromUrlName(
  config: HasSharedConfig,
  param: string,
): Line {
  const line = getLineFromUrlName(config, param);
  if (line == null) {
    throw new Error(`No line matching ID or url name "${param}".`);
  }
  return line;
}

/** E.g. "/stop/pakenham" or "/stop/20". */
export function getStopPageRoute(
  config: HasSharedConfig,
  stop: StopID,
  time: QLocalDateTime | null,
  filter: DepartureFilter | null,
): string {
  const base = `/stop/${getStopUrlName(config, stop) ?? stop.toFixed()}`;
  const params: { key: string; value: string }[] = [];
  if (time != null) {
    params.push({ key: "time", value: time.toISO() });
  }
  if (filter != null && !filter.isDefault()) {
    params.push({
      key: "filter",
      value: filter.asString(),
    });
  }
  if (params.length === 0) {
    return base;
  }
  return (
    base +
    "?" +
    params.map((p) => `${p.key}=${encodeURIComponent(p.value)}`).join("&")
  );
}

/** E.g. "/line/pakenham" or "/line/20". */
export function getLinePageRoute(
  config: HasSharedConfig,
  line: LineID,
): string {
  return `/line/${getLineUrlName(config, line) ?? line.toFixed()}`;
}

/** E.g. "/train/[something]" or "/train/gtfs/[something]". */
export function getServicePageRoute(
  service: Service,
  perspectiveIndex?: number,
): string {
  // <TEMP>
  // Not all services will either have a static ID or a GTFS ID in the future!
  // They might have both, or PTV API, or something!
  const piParam =
    perspectiveIndex == null ? "" : `?from=${perspectiveIndex.toFixed()}`;

  const gtfs = service.sources.find((s) => s.source === "gtfs");
  if (gtfs != null) {
    return `/train/gtfs/${gtfs.id}` + piParam;
  } else {
    return `/train/ttbl/${service.staticID}` + piParam;
  }
  // </TEMP>
}

export function getServiceType(
  config: HasSharedConfig,
  serviceType: ServiceTypeID,
) {
  return config.shared.serviceTypes.find((l) => l.id === serviceType) ?? null;
}

export function requireServiceType(
  config: HasSharedConfig,
  serviceType: ServiceTypeID,
) {
  const serviceTypeData = getServiceType(config, serviceType);
  if (serviceTypeData == null) {
    throw new Error(`No service type with ID "${serviceType}".`);
  }
  return serviceTypeData;
}

export function getContinuationGroupForLine(
  config: HasSharedConfig,
  line: LineID,
): LinearContinuationGroup | HookContinuationGroup | null {
  return (
    config.shared.continuationRules.find((r) => {
      if (r instanceof LinearContinuationGroup) {
        return r.sideA.includes(line) || r.sideB.includes(line);
      } else {
        return r.lines.includes(line);
      }
    }) ?? null
  );
}
