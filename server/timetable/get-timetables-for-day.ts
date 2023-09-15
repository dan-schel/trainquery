import { QDate } from "../../shared/qtime/qdate";
import { LineID } from "../../shared/system/ids";
import { Timetable } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";

export function getTimetablesForDay(
  ctx: TrainQuery,
  day: QDate,
  lines: LineID[]
) {
  const result: Timetable[] = [];

  for (const l of lines) {
    const timetables = ctx
      .getConfig()
      .server.timetables.filter(
        (t) => t.line == l && isWithin(day, t.begins, t.ends)
      );

    // There should only be (at most) one of each type at a time, so we're fine
    // to just get the first one of each type.
    const main = timetables.find((t) => !t.isTemporary);
    const temporary = timetables.find((t) => t.isTemporary);

    if (temporary != null) {
      result.push(temporary);
    }
    if (main != null) {
      result.push(main);
    }
  }
  return result;
}

function isWithin(day: QDate, begins: QDate | null, ends: QDate | null) {
  if (begins != null && day.isBefore(begins)) {
    return false;
  }
  if (ends != null && day.isAfter(ends)) {
    return false;
  }
  return true;
}
