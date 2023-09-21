import { QDate } from "../../shared/qtime/qdate";
import { toUTCDateTime } from "../../shared/qtime/qdatetime";
import { toStaticServiceID } from "../../shared/system/ids";
import { Departure } from "../../shared/system/timetable/departure";
import { ServiceStop } from "../../shared/system/timetable/service-stop";
import { CompleteStoppingPattern } from "../../shared/system/timetable/stopping-pattern";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";

export function specificize(
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate,
  perspectiveIndex: number): Departure {

  const staticID = toStaticServiceID(`TODO-${entry.entryIndex}`);
  const stoppingPattern = new CompleteStoppingPattern(
    entry.rows.map(r => {
      if (r == null) {
        return null;
      }

      const time = toUTCDateTime(date, r, ctx.getConfig().computed.offset.get(date));

      // TODO: These values are temporary!
      const setsDown = true;
      const picksUp = true;
      const platform = null;

      return new ServiceStop(time, null, setsDown, picksUp, platform);
    })
  );
  const perspective = stoppingPattern.stops[perspectiveIndex];
  if (perspective == null) {
    throw new Error("Incorrect perspective index.");
  }

  return new Departure(entry.line, [], entry.route, entry.direction, stoppingPattern, staticID, [], null, perspectiveIndex, perspective);
}
