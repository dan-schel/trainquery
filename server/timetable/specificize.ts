import { QDate } from "../../shared/qtime/qdate";
import { toUTCDateTime } from "../../shared/qtime/qdatetime";
import { requireLine } from "../../shared/system/config-utils";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";
import { guessPlatformsOfEntry } from "./guess-platform";
import { StaticServiceIDComponents } from "./static-service-id";
import { CompletePattern } from "../../shared/system/service/complete-pattern";
import { SkippedStop } from "../../shared/system/service/skipped-stop";
import { ServedStop } from "../../shared/system/service/served-stop";
import { Service } from "../../shared/system/service/service";
import { Departure } from "../../shared/system/service/departure";

export function specificize(
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate,
) {
  const staticID = new StaticServiceIDComponents(
    entry.id,
    entry.entryIndex,
    date,
  ).encode();

  const platforms = guessPlatformsOfEntry(ctx, entry, date);
  const line = requireLine(ctx.getConfig(), entry.line);
  const stopList = line.route.requireStopList(entry.route, entry.direction);
  const offset = ctx.getConfig().computed.offset.get(date);

  const stoppingPattern = new CompletePattern(
    entry.rows.map((r, i) => {
      if (r == null) {
        return new SkippedStop(stopList.stops[i], i);
      }

      const time = toUTCDateTime(date, r, offset);
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
        platform,
      );
    }),
  );

  return new Service(
    entry.line,
    [],
    entry.route,
    entry.direction,
    stoppingPattern,
    staticID,
    [],
    null,
  );
}

export function specificizeDeparture(
  ctx: TrainQuery,
  entry: FullTimetableEntry,
  date: QDate,
  perspectiveIndex: number,
): Departure {
  const service = specificize(ctx, entry, date);
  return Departure.fromService(service, perspectiveIndex);
}
