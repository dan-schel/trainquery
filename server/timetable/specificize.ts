import { QDate } from "../../shared/qtime/qdate";
import { toUTCDateTime } from "../../shared/qtime/qdatetime";
import {
  getServicePageRoute,
  requireLine,
} from "../../shared/system/config-utils";
import { FullTimetableEntry } from "../../shared/system/timetable/timetable";
import { TrainQuery } from "../trainquery";
import { guessPlatformsOfEntry, guessPlatformsOfTrip } from "./guess-platform";
import { StaticServiceIDComponents } from "./static-service-id";
import { CompletePattern } from "../../shared/system/service/complete-pattern";
import { SkippedStop } from "../../shared/system/service/skipped-stop";
import { ServedStop } from "../../shared/system/service/served-stop";
import { Service } from "../../shared/system/service/service";
import { Departure } from "../../shared/system/service/departure";
import { GtfsServiceIDComponents } from "../gtfs/gtfs-service-id";
import { getGtfsServiceNoRealtime } from "./get-service";
import { GtfsTrip, GtfsTripIDPair } from "../gtfs/data/gtfs-trip";
import { GtfsRealtimeTrip } from "../gtfs/data/gtfs-realtime-trip";
import { itsOk } from "@dan-schel/js-utils";

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
    {
      "Timetable ID": entry.id.toFixed(),
      "Entry index": entry.entryIndex.toFixed(),
    },
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

export function specificizeGtfsTrip(
  ctx: TrainQuery,
  trip: GtfsTrip,
  gtfsCalendarID: string,
  date: QDate,
): Service<CompletePattern> {
  // TODO: Encode trip ID (for the given calendar ID), continuation index, and
  // date into a single string.
  const idPair = trip.requireIDPair(gtfsCalendarID);
  const id = new GtfsServiceIDComponents(
    idPair.gtfsTripID,
    idPair.continuationIndex,
    trip.gtfsSubfeedID,
    date,
  ).encode();

  const platforms = guessPlatformsOfTrip(ctx, trip, date);
  const line = requireLine(ctx.getConfig(), trip.line);
  const stopList = line.route.requireStopList(trip.route, trip.direction);
  const offset = ctx.getConfig().computed.offset.get(date);

  const liveTimes =
    GtfsRealtimeTrip.isRealtime(trip) && trip.liveDate.equals(date)
      ? trip.liveTimes
      : null;

  const stoppingPattern = new CompletePattern(
    trip.times.map((r, i) => {
      if (r == null) {
        return new SkippedStop(stopList.stops[i], i);
      }

      const time = toUTCDateTime(date, r.time, offset);
      const liveTime =
        liveTimes != null && liveTimes[i] != null
          ? toUTCDateTime(date, itsOk(liveTimes[i]).time, offset)
          : null;
      const platform = platforms[i];
      const setsDown = stopList.setsDown[i].matches(trip.direction);
      const picksUp = stopList.picksUp[i].matches(trip.direction);

      return new ServedStop(
        stopList.stops[i],
        i,
        time,
        liveTime,
        setsDown,
        picksUp,
        platform,
      );
    }),
  );

  return new Service(
    trip.line,
    [],
    trip.route,
    trip.direction,
    stoppingPattern,
    null,
    [
      {
        source: "gtfs",
        id: id,
      },
    ],
    null,
    getGtfsTripDebugInfo(ctx, trip, idPair, gtfsCalendarID, date),
  );
}

export function specificizeGtfsDeparture(
  ctx: TrainQuery,
  trip: GtfsTrip,
  gtfsCalendarID: string,
  date: QDate,
  perspectiveIndex: number,
): Departure {
  const service = specificizeGtfsTrip(ctx, trip, gtfsCalendarID, date);
  return Departure.fromService(service, perspectiveIndex);
}

function getGtfsTripDebugInfo(
  ctx: TrainQuery,
  trip: GtfsTrip,
  idPair: GtfsTripIDPair,
  gtfsCalendarID: string,
  date: QDate,
) {
  let previousTripID: object = {};
  if (idPair.continuationIndex > 0) {
    const originalID = new GtfsServiceIDComponents(
      idPair.gtfsTripID,
      idPair.continuationIndex - 1,
      trip.gtfsSubfeedID,
      date,
    );
    const originalService = getGtfsServiceNoRealtime(ctx, originalID);

    if (originalService != null) {
      const url = getServicePageRoute(originalService);
      previousTripID = {
        "Previous trip": ctx.getConfig().shared.canonicalUrl + url,
      };
    } else {
      previousTripID = {
        "Previous trip": "<not found>",
      };
    }
  }

  return {
    "Subfeed ID": trip.gtfsSubfeedID ?? "<no subfeed>",
    "Trip ID": idPair.gtfsTripID,
    "Continuation index": idPair.continuationIndex.toFixed(),
    "Relevant calendar": gtfsCalendarID,
    "All calendars": trip.idPairs.map((x) => x.gtfsCalendarID).join(", "),
    ...previousTripID,
  };
}
