import { nonNull, parseIntNull } from "@schel-d/js-utils";
import { Timetable, TimetableEntry } from "./timetable";
import {
  isDirectionID,
  isLineID,
  isRouteVariantID,
  isStopID,
  isTimetableID,
} from "../ids";
import { QDate } from "../../qtime/qdate";
import { QWeekdayRange } from "../../qtime/qweekdayrange";
import { QTimetableTime } from "../../qtime/qtime";

export type ErrorLogger = (error: string) => void;

type ErrorProcedure = (error: string) => null;

export function parseTtbl(
  input: string,
  logError?: ErrorLogger,
): Timetable | null {
  const error = (message: string) => {
    if (logError != null) {
      logError(message);
    }
    return null;
  };

  const lines = input
    .split("\n")
    .map((l) => l.normalize().toLowerCase().trim())
    .filter((l) => l.length !== 0);

  if (lines[0] !== "[timetable]" || lines[1] !== "version: 4") {
    return error("Unrecognized format.");
  }

  // Group the lines into each section.
  const sections: string[][] = [];
  let section: string[] | null = null;
  for (const line of lines) {
    if (line.startsWith("[")) {
      if (section != null) {
        sections.push(section);
      }
      section = [line];
    } else if (section != null) {
      section.push(line);
    }
  }
  if (section != null) {
    sections.push(section);
  }

  // The first section is always the metadata section ("[timetable]").
  const metadata = parseMetadata(sections[0], error);
  if (metadata == null) {
    return null;
  }

  // Every other section must be a grid.
  const entries = sections.slice(1).map((g) => parseGrid(g, error));
  if (entries.some((e) => e == null)) {
    return null;
  }

  return new Timetable(
    metadata.id,
    metadata.line,
    metadata.isTemporary,
    metadata.begins,
    metadata.ends,
    metadata.created,
    entries.filter(nonNull).flat(),
  );
}

function parseMetadata(metadataInput: string[], error: ErrorProcedure) {
  const fields = metadataInput.slice(1).map((s) => ({
    key: s.split(":")[0].trim(),
    value: s.split(":")[1].trim(),
  }));
  const get = (key: string) => fields.find((m) => m.key === key)?.value;

  // Parse timetable ID.
  const timetableIDString = get("id");
  if (timetableIDString == null) {
    return error("Metadata is missing 'id'.");
  }
  const timetableID = parseIntNull(timetableIDString);
  if (timetableID == null || !isTimetableID(timetableID)) {
    return error(`"${timetableIDString}" is not a timetable ID.`);
  }

  // Parse line and ensure it exists.
  const lineIDString = get("line");
  if (lineIDString == null) {
    return error("Metadata is missing 'line'.");
  }
  const lineID = parseIntNull(lineIDString);
  if (lineID == null || !isLineID(lineID)) {
    return error(`"${lineIDString}" is not a line ID.`);
  }

  // Parse "type: main" or "type: temporary".
  const typeString = get("type");
  if (typeString == null) {
    return error("Metadata is missing 'type'.");
  }
  if (typeString !== "main" && typeString !== "temporary") {
    return error(`"${typeString} is not a valid type of timetable.`);
  }

  // Parse begins and ends date.
  const wildcardDate = (input: string) => {
    if (input === "*") {
      return null;
    }
    const date = QDate.parse(input);
    if (date == null) {
      return "INVALID!";
    }
    return date;
  };
  const beginsString = get("begins");
  if (beginsString == null) {
    return error("Metadata is missing 'begins'.");
  }
  const begins = wildcardDate(beginsString);
  if (begins === "INVALID!") {
    return error(
      `"${beginsString}" is not a ISO8601 compliant date (or a "*").`,
    );
  }
  const endsString = get("ends");
  if (endsString == null) {
    return error("Metadata is missing 'ends'.");
  }
  const ends = wildcardDate(endsString);
  if (ends === "INVALID!") {
    return error(`"${endsString}" is not a ISO8601 compliant date (or a "*").`);
  }

  // Parse created date.
  const createdString = get("created");
  if (createdString == null) {
    return error("Metadata is missing 'created'.");
  }
  const created = QDate.parse(createdString);
  if (created == null) {
    return error(`"${createdString}" is not a ISO8601 compliant date.`);
  }

  return {
    id: timetableID,
    line: lineID,
    isTemporary: typeString === "temporary",
    begins: begins,
    ends: ends,
    created: created,
  };
}

function parseGrid(
  gridInput: string[],
  error: ErrorProcedure,
): TimetableEntry[] | null {
  if (!/^\[[^[\]]+\][^[\]]*$/g.test(gridInput[0])) {
    return error(
      "Grid header unrecognized. Could not find opening/closing brackets.",
    );
  }

  // Retrieve and validate the route variant and direction.
  const args = gridInput[0]
    .replace(/\[|\].+/g, "")
    .split(",")
    .map((s) => s.trim());
  if (args.length !== 2) {
    return error("Expecting two arguments in grid header.");
  }
  const routeVariant = args[0];
  if (!isRouteVariantID(routeVariant)) {
    return error(`"${routeVariant}" is not a route variant ID.`);
  }
  const direction = args[1];
  if (!isDirectionID(direction)) {
    return error(`"${direction}" is not a direction ID.`);
  }

  // Retrieve each weekday range in the header row.
  const potentialWDRs = gridInput[0]
    .replace(/\[.+\]\s+/g, "")
    .split(/\s+/g)
    .map((s) => ({ input: s, wdr: QWeekdayRange.parse(s.trim()) }));
  const badWDR = potentialWDRs.find((w) => w.wdr == null);
  if (badWDR != null) {
    return error(`"${badWDR.input}" is not a valid weekday range.`);
  }
  const wdrs = potentialWDRs.map((w) => w.wdr).filter(nonNull);

  // Treat every other line as a row in the grid.
  const potentialRows = gridInput.slice(1).map((r) => {
    const terms = r.split(/\s+/g).map((s) => s.trim());
    if (terms.length !== wdrs.length + 2) {
      return error(`Rows in the grid have inconsistent numbers of columns.`);
    }

    // Ensure the first term is a stop ID.
    const stopID = parseIntNull(terms[0]);
    if (stopID == null || !isStopID(stopID)) {
      return error(`"${terms[0]}" is not a stop ID.`);
    }

    // Ensure every other term is a timetable time or "-".
    const potentialTimes = terms.slice(2).map((t) => ({
      input: t,
      time: t === "-" ? null : QTimetableTime.parse(t) ?? ("INVALID!" as const),
    }));
    const badTime = potentialTimes.find((t) => t.time === "INVALID!");
    if (badTime != null) {
      return error(
        `"${badTime.input}" is not a valid timetable time string (or a "-").`,
      );
    }
    return potentialTimes
      .map((t) => t.time)
      .filter((t): t is QTimetableTime | null => t !== "INVALID!");
  });
  if (potentialRows.some((r) => r == null)) {
    return null;
  }
  const rows = potentialRows.filter(nonNull);

  // Convert rows to entries.
  const entries = wdrs.map(
    (w, i) =>
      new TimetableEntry(
        routeVariant,
        direction,
        w,
        rows.map((r) => r[i]),
      ),
  );

  return entries;
}
