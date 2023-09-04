import { parseIntNull } from "@schel-d/js-utils/dist/types";
import { Timetable, TimetableEntry } from "./timetable";
import { isLineID, isTimetableID } from "../ids";
import { getLine } from "../config-utils";
import { ServerConfig } from "../config";
import { QDate } from "../../qtime/qdate";

export type ErrorLogger = (error: string) => void;

type ErrorProcedure = (error: string) => null;

export function parseTTBL(
  config: ServerConfig,
  input: string,
  logError?: ErrorLogger
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
    .filter((l) => l.length != 0);

  if (lines[0] != "[timetable]" || lines[1] != "version: 4") {
    return error("Unrecognized format.");
  }

  // Group the lines into each section.
  const sections: string[][] = [];
  let section: string[] | null = null;
  for (const line of lines) {
    if (line.startsWith("[") && line.endsWith("]")) {
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
  const metadata = parseMetadata(config, sections[0], error);
  if (metadata == null) {
    return null;
  }

  // TODO: actually parse the entries!
  const entries: TimetableEntry[] = [];

  return new Timetable(
    metadata.id,
    metadata.line.id,
    metadata.isTemporary,
    metadata.begins,
    metadata.ends,
    metadata.created,
    entries
  );
}

function parseMetadata(
  config: ServerConfig,
  metadataInput: string[],
  error: ErrorProcedure
) {
  const fields = metadataInput
    .slice(1)
    .map((s) => ({ key: s.split(":")[0], value: s.split(":")[1] }));
  const get = (key: string) => fields.find((m) => m.key == key)?.value;

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
  const line = getLine(config, lineID);
  if (line == null) {
    return error(`No line exists with ID ${lineID}.`);
  }

  // Parse "type: main" or "type: temporary".
  const typeString = get("type");
  if (typeString == null) {
    return error("Metadata is missing 'type'.");
  }
  if (typeString != "main" && typeString != "temporary") {
    return error(`"${typeString} is not a valid type of timetable.`);
  }

  // Parse begins and ends date.
  const wildcardDate = (input: string) => {
    if (input == "*") {
      return null;
    }
    const date = QDate.parse(input);
    if (date == null || !date.isValid().valid) {
      return "INVALID!";
    }
    return date;
  };
  const beginsString = get("begins");
  if (beginsString == null) {
    return error("Metadata is missing 'begins'.");
  }
  const begins = wildcardDate(beginsString);
  if (begins == "INVALID!") {
    return error(
      `"${beginsString}" is not a ISO8601 compliant date (or a '*').`
    );
  }
  const endsString = get("ends");
  if (endsString == null) {
    return error("Metadata is missing 'ends'.");
  }
  const ends = wildcardDate(endsString);
  if (ends == "INVALID!") {
    return error(`"${endsString}" is not a ISO8601 compliant date (or a '*').`);
  }

  // Parse created date.
  const createdString = get("created");
  if (createdString == null) {
    return error("Metadata is missing 'created'.");
  }
  const created = QDate.parse(createdString);
  if (created == null || !created.isValid().valid) {
    return error(`"${createdString}" is not a ISO8601 compliant date.`);
  }

  return {
    id: timetableID,
    line: line,
    isTemporary: typeString == "temporary",
    begins: begins,
    ends: ends,
    created: created,
  };
}
