import { nonNull, unique } from "@schel-d/js-utils";
import {
  type HasSharedConfig,
  requireLine,
  requireStop,
} from "../config-utils";
import { Timetable } from "./timetable";
import { type DirectionID, type RouteVariantID } from "../ids";
import { QWeekdayRange } from "../../qtime/qweekdayrange";

export function writeTtbl(config: HasSharedConfig, timetable: Timetable) {
  const routeDirectionPairs = unique(
    timetable.entries.map((e) => ({ route: e.route, direction: e.direction })),
    (a, b) => a.route == b.route && a.direction == b.direction
  );

  const includeSeconds = timetable.entries.some((e) =>
    e.rows.some((s) => s != null && s.second != 0)
  );

  const grids = routeDirectionPairs
    .map((p) =>
      writeGrid(
        config,
        timetable,
        p.route,
        p.direction,

        // TODO: Use this function to restrict different weekday ranges to
        // different grids.
        (_wdr) => true,

        includeSeconds
      )
    )
    .filter(nonNull);

  return `${writeMetadata(timetable)}\n${grids.join("\n")}`;
}

function writeMetadata(timetable: Timetable): string {
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
function writeGrid(
  config: HasSharedConfig,
  timetable: Timetable,
  route: RouteVariantID,
  direction: DirectionID,
  matchesWdr: (wdr: QWeekdayRange) => boolean,
  includeSeconds: boolean
): string | null {
  const entries = timetable.entries.filter(
    (e) =>
      e.route == route && e.direction == direction && matchesWdr(e.weekdayRange)
  );

  if (entries.length == 0) {
    return null;
  }

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

  const headerSize = Math.max(
    header.length,
    ...stopHeaders.map((h) => h.length)
  );
  const columnSize = includeSeconds ? 10 : 8;

  const wdrs = entries
    .map((e) => e.weekdayRange.toString().padEnd(columnSize, " "))
    .join("");
  const headerRow = `${header.padEnd(headerSize, " ")} ${wdrs}`;

  const times = entries.map((e) =>
    e.rows.map((r) => (r == null ? "-" : r.toTtblString(includeSeconds)))
  );
  const gridRows = stops.map(
    (_s, i) =>
      `${stopHeaders[i].padEnd(headerSize, " ")} ${times
        .map((t) => t[i].padEnd(columnSize, " "))
        .join("")}`
  );

  return `${headerRow}\n${gridRows.join("\n")}\n`;
}
