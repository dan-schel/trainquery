import { nonNull, parseIntNull } from "@dan-schel/js-utils";
import { Timetable, TimetableEntry } from "./timetable";
import {
  isLineID,
  isStopID,
  isTimetableID,
  toDirectionID,
  toRouteVariantID,
} from "../ids";
import { QDate } from "../../qtime/qdate";
import { QWeekdayRange } from "../../qtime/qweekdayrange";
import { QTimetableTime } from "../../qtime/qtime";
import { LinearRoute } from "../routes/linear-route";
import { HookRoute } from "../routes/hook-route";
import type { ErrorLogger } from "../../utils";

type ErrorProcedure = (error: string) => null;

/**
 * Until the ttbl v4 editor is ready, allows the import of "v3.5" timetables.
 * This entire file is temporary!
 */
export function parseTtblV3Compat(
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

  if (lines[0] !== "[timetable]" || lines[1] !== "version: 3.5") {
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
  if (!/^\[[^[\]]+\]$/g.test(gridInput[0])) {
    return error(
      "Grid header unrecognized. Could not find opening/closing brackets.",
    );
  }

  // Retrieve and validate the route variant and direction.
  const args = gridInput[0]
    .replace(/\[|\]/g, "")
    .split(",")
    .map((s) => s.trim());
  if (args.length !== 2) {
    return error("Expecting two arguments in grid header.");
  }

  const route = getRouteVariantAndDirection(args[0]);
  if (route == null) {
    return error(
      `"${args[0]}" is cannot be interpreted (in v3.5 compatibility mode).`,
    );
  }
  const wdr = QWeekdayRange.parse(args[1]);
  if (wdr == null) {
    return error(`"${args[1]}" is not a weekday range.`);
  }

  // Treat every other line as a row in the grid.
  let colCount: number | null = null;
  const potentialRows = gridInput.slice(1).map((r) => {
    const terms = r.split(/\s+/g).map((s) => s.trim());
    if (colCount != null && terms.length !== colCount) {
      return error(`Rows in the grid have inconsistent numbers of columns.`);
    }
    colCount = terms.length;

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

  // Ignore the columns for the stop ID and stop name.
  const entryCount = colCount! - 2;

  // Convert rows to entries.
  const entries = [];
  for (let i = 0; i < entryCount; i++) {
    entries.push(
      new TimetableEntry(
        route.variant,
        route.direction,
        wdr,
        rows.map((r) => r[i]),
      ),
    );
  }

  return entries;
}

function getRouteVariantAndDirection(arg0: string) {
  if (arg0 === "up") {
    return {
      variant: LinearRoute.regularID,
      direction: toDirectionID("up"),
    };
  } else if (arg0 === "down") {
    return {
      variant: LinearRoute.regularID,
      direction: toDirectionID("down"),
    };
  } else if (arg0 === "up-direct") {
    return {
      variant: HookRoute.directID,
      direction: toDirectionID("up"),
    };
  } else if (arg0 === "down-direct") {
    return {
      variant: HookRoute.directID,
      direction: toDirectionID("down"),
    };
  } else if (arg0 === "up-via-loop") {
    return {
      variant: HookRoute.hookedID,
      direction: toDirectionID("up"),
    };
  } else if (arg0 === "down-via-loop") {
    return {
      variant: HookRoute.hookedID,
      direction: toDirectionID("down"),
    };
  } else if (arg0.endsWith("-up")) {
    return {
      variant: toRouteVariantID(arg0.replace("-up", "")),
      direction: toDirectionID("up"),
    };
  } else if (arg0.endsWith("-down")) {
    return {
      variant: toRouteVariantID(arg0.replace("-down", "")),
      direction: toDirectionID("down"),
    };
  } else {
    return null;
  }
}
