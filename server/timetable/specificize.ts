import { QDate } from "../../shared/qtime/qdate";
import { toUTCDateTime } from "../../shared/qtime/qdatetime";
import { Departure } from "../../shared/system/timetable/departure";
import { ServiceStop } from "../../shared/system/timetable/service-stop";
import { CompleteStoppingPattern } from "../../shared/system/timetable/stopping-pattern";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";
import { guessPlatformsOfEntry } from "./guess-platform";
import { StaticServiceIDComponents } from "./static-service-id";

export function specificize(
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate,
  perspectiveIndex: number
): Departure {
  const staticID = new StaticServiceIDComponents(entry.id, entry.entryIndex, date).encode();
  const platforms = guessPlatformsOfEntry(ctx, entry, date);
  const stoppingPattern = new CompleteStoppingPattern(
    entry.rows.map((r, i) => {
      if (r == null) {
        return null;
      }

      const time = toUTCDateTime(
        date,
        r,
        ctx.getConfig().computed.offset.get(date)
      );

      const platform = platforms[i];

      // TODO: These values are temporary!
      const setsDown = true;
      const picksUp = true;

      return new ServiceStop(time, null, setsDown, picksUp, platform);
    })
  );
  const perspective = stoppingPattern.stops[perspectiveIndex];
  if (perspective == null) {
    throw new Error("Incorrect perspective index.");
  }

  return new Departure(
    entry.line,
    [],
    entry.route,
    entry.direction,
    stoppingPattern,
    staticID,
    [],
    null,
    perspectiveIndex,
    perspective
  );
}
