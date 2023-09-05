import { nonNull, unique } from "@schel-d/js-utils";
import { HasSharedConfig, requireLine, requireStop } from "../config-utils";
import { Timetable } from "./timetable";
import { DirectionID, RouteVariantID } from "../ids";
import { QWeekdayRange } from "../../qtime/qweekdayrange";

export function writeTtbl(config: HasSharedConfig, timetable: Timetable) {
  const routeDirectionPairs = unique(
    timetable.entries.map((e) => ({ route: e.route, direction: e.direction })),
    (a, b) => a.route == b.route && a.direction == b.direction
  );

  const grids = routeDirectionPairs
    .map((p) =>
      writeGrid(config, timetable, p.route, p.direction, (_wdr) => true)
    )
    .filter(nonNull);

  return `${writeMetadata(timetable)}\n${grids.join("\n")}`;
}

export function writeMetadata(timetable: Timetable): string {
  return (
    `[timetable]\n` +
    `version: 4\n` +
    `id: ${timetable.id.toFixed()}\n` +
    `line: ${timetable.line.toFixed()}\n` +
    `type: ${timetable.isTemporary ? "temporary" : "main"}\n` +
    `begins: ${timetable.begins == null ? "*" : timetable.begins.toISO()}\n` +
    `ends: ${timetable.ends == null ? "*" : timetable.ends.toISO()}\n` +
    `created: ${timetable.created.toISO()}\n`
  );
}

/** Returns a ttbl grid string for one section, or null if no entries match. */
export function writeGrid(
  config: HasSharedConfig,
  timetable: Timetable,
  route: RouteVariantID,
  direction: DirectionID,
  matchesWdr: (wdr: QWeekdayRange) => boolean
): string | null {
  const entries = timetable.entries.filter(
    (e) =>
      e.route == route && e.direction == direction && matchesWdr(e.weekdayRange)
  );

  const header = `[${route}, ${direction}]`;
  const stops = requireLine(config, timetable.line).route.getStops(
    route,
    direction
  );

  const maxStopIDDigits = Math.max(...stops).toFixed().length;
  const stopHeaders = stops.map((s) => {
    const idString = s.toFixed().padStart(maxStopIDDigits, "0");
    const kebabName = requireStop(config, s)
      .name.toLowerCase()
      .replace(/\s/g, "-");
    return `${idString} ${kebabName}`;
  });

  return null;
}
