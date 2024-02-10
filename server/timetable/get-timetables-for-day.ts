import { nonNull } from "@dan-schel/js-utils";
import { QDate } from "../../shared/qtime/qdate";
import { LineID } from "../../shared/system/ids";
import { TrainQuery } from "../trainquery";

export function getTimetableForDay(ctx: TrainQuery, day: QDate, line: LineID) {
  const timetables = ctx
    .getConfig()
    .server.timetables.filter(
      (t) =>
        t.line === line &&
        day.isWithin(t.begins, t.ends, { maxInclusive: true }),
    );

  // There should only be (at most) one of each type at a time, so we're fine
  // to just get the first one of each type.
  const main = timetables.find((t) => !t.isTemporary);
  const temporary = timetables.find((t) => t.isTemporary);

  if (temporary != null) {
    return temporary;
  }
  if (main != null) {
    return main;
  }
  return null;
}

export function getTimetablesForDay(
  ctx: TrainQuery,
  day: QDate,
  lines: LineID[],
) {
  return lines.map((l) => getTimetableForDay(ctx, day, l)).filter(nonNull);
}
