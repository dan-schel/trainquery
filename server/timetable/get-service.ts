import { QDayOfWeek } from "../../shared/qtime/qdayofweek";
import { Service } from "../../shared/system/timetable/service";
import { TrainQuery } from "../trainquery";
import { getTimetableForDay } from "./get-timetables-for-day";
import { specificize } from "./specificize";
import { StaticServiceIDComponents } from "./static-service-id";

export function getService(
  ctx: TrainQuery,
  id: StaticServiceIDComponents
): Service | null {
  const timetable = ctx
    .getConfig()
    .server.timetables.find((t) => t.id == id.timetable);
  if (timetable == null) {
    return null;
  }

  const entry = timetable.entries[id.index];
  if (entry == null) {
    return null;
  }

  if (!entry.weekdayRange.includes(QDayOfWeek.fromDate(id.date))) {
    return null;
  }

  if (timetable.id != getTimetableForDay(ctx, id.date, timetable.line)?.id) {
    // TODO: Instead of 404ing the page, we could show a warning that the
    // timetable is outdated.
    return null;
  }

  const service = specificize(ctx, entry, id.date);
  return service;
}
