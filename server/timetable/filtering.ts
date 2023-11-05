import { nonNull } from "@schel-d/js-utils";
import { requireLine } from "../../shared/system/config-utils";
import {
  DirectionID,
  RouteVariantID,
  ServiceTypeID,
  StopID,
} from "../../shared/system/ids";
import { GtfsPossibility } from "../departures/gtfs-departure-source";
import { TimetablePossibility } from "../departures/timetable-departure-source";
import { TrainQuery } from "../trainquery";
import { QDayOfWeek } from "../../shared/qtime/qdayofweek";
import { LineColor } from "../../shared/system/enums";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { GtfsTrip } from "../gtfs/gtfs-data";
import { Line } from "../../shared/system/line";
import { QDate } from "../../shared/qtime/qdate";

export type GeneralFilteringData = {
  line: Line;
  color: LineColor;
  direction: DirectionID;
  routeVariant: RouteVariantID;
  serviceType: ServiceTypeID;
  origin: StopID;
  stops: StopID[];
  terminus: StopID;
  routeStopList: StopID[];
};

export type DepartureFilteringData = GeneralFilteringData & {
  isArrival: boolean;
  picksUp: boolean;
};
export type PlatformFilteringData = GeneralFilteringData & {
  dayOfWeek: QDayOfWeek;
};
export type AllFilteringData = DepartureFilteringData & PlatformFilteringData;

export function getFilteringData(
  ctx: TrainQuery,
  x: FullTimetableEntry | GtfsTrip,
): GeneralFilteringData {
  const rows = x instanceof FullTimetableEntry ? x.rows : x.times;

  const line = requireLine(ctx.getConfig(), x.line);
  const stopList = line.route.requireStops(x.route, x.direction);
  const stops = rows
    .map((r, i) => (r != null ? stopList[i] : null))
    .filter(nonNull);

  return {
    line: line,
    color: line.color,
    direction: x.direction,
    routeVariant: x.route,
    serviceType: line.serviceType,
    origin: stops[0],
    stops: stops,
    terminus: stops[stops.length - 1],
    routeStopList: stopList,
  };
}

export function upgradeToDepartureFilteringData(
  data: GeneralFilteringData,
  x: TimetablePossibility | GtfsPossibility,
): DepartureFilteringData {
  const rows = "entry" in x ? x.entry.rows : x.trip.times;

  // Filter arrivals.
  const isArrival = rows.slice(x.perspectiveIndex + 1).every((x) => x == null);

  // Filter set-down-only services.
  const picksUp = data.line.route.picksUp(
    data.routeVariant,
    data.direction,
    x.perspectiveIndex,
  );

  return {
    ...data,
    isArrival: isArrival,
    picksUp: picksUp,
  };
}
export function upgradeToPlatformFilteringData(
  data: GeneralFilteringData,
  date: QDate,
): PlatformFilteringData {
  return {
    ...data,
    dayOfWeek: QDayOfWeek.fromDate(date),
  };
}

export function getPlatformFilteringData(
  ctx: TrainQuery,
  x: FullTimetableEntry | GtfsTrip,
  date: QDate,
) {
  const base = getFilteringData(ctx, x);
  return upgradeToPlatformFilteringData(base, date);
}
export function getAllFilteringData(
  ctx: TrainQuery,
  x: TimetablePossibility | GtfsPossibility,
): AllFilteringData {
  const base = getFilteringData(ctx, "entry" in x ? x.entry : x.trip);
  return {
    ...upgradeToDepartureFilteringData(base, x),
    ...upgradeToPlatformFilteringData(base, x.date),
  };
}
