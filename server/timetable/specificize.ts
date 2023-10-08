import { QDate } from "../../shared/qtime/qdate";
import { toUTCDateTime } from "../../shared/qtime/qdatetime";
import { requireLine } from "../../shared/system/config-utils";
import { Departure } from "../../shared/system/timetable/departure";
import { Service } from "../../shared/system/timetable/service";
import {
  ServedStop,
  SkippedStop,
} from "../../shared/system/timetable/service-stop";
import { CompleteStoppingPattern } from "../../shared/system/timetable/stopping-pattern";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";
import { guessPlatformsOfEntry } from "./guess-platform";
import { StaticServiceIDComponents } from "./static-service-id";

export function specificize(
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate
) {
  const staticID = new StaticServiceIDComponents(
    entry.id,
    entry.entryIndex,
    date
  ).encode();
  const platforms = guessPlatformsOfEntry(ctx, entry, date);
  const line = requireLine(ctx.getConfig(), entry.line);
  const stopList = line.route.requireStopList(entry.route, entry.direction);

  const stoppingPattern = new CompleteStoppingPattern(
    entry.rows.map((r, i) => {
      if (r == null) {
        return new SkippedStop(stopList.stops[i], i);
      }

      const time = toUTCDateTime(
        date,
        r,
        ctx.getConfig().computed.offset.get(date)
      );

      const platform = platforms[i];
      const setsDown = stopList.setsDown[i].matches(entry.direction);
      const picksUp = stopList.picksUp[i].matches(entry.direction);

      return new ServedStop(
        stopList.stops[i],
        i,
        time,
        null,
        setsDown,
        picksUp,
        platform
      );
    })
  );

  return new Service(
    entry.line,
    [],
    entry.route,
    entry.direction,
    stoppingPattern,
    staticID,
    [],
    null
  );
}

export function specificizeDeparture(
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate,
  perspectiveIndex: number
): Departure {
  const service = specificize(ctx, entry, date);

  // Full timetable entrys will always specificize to a service with a complete
  // stopping pattern.
  const stoppingPattern = service.stoppingPattern as CompleteStoppingPattern;

  const perspective = stoppingPattern.stops[perspectiveIndex];
  if (perspective.express) {
    throw new Error("Incorrect perspective index.");
  }

  return Departure.fromService(service, perspectiveIndex, perspective);
}
