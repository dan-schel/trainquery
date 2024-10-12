import { QDayOfWeek } from "../../shared/qtime/qdayofweek";
import { GtfsData } from "../gtfs/data/gtfs-data";
import { GtfsServiceIDComponents } from "../gtfs/gtfs-service-id";
import { TrainQuery } from "../ctx/trainquery";
import { getTimetableForDay } from "./get-timetables-for-day";
import { specificize, specificizeGtfsTrip } from "./specificize";
import { StaticServiceIDComponents } from "./static-service-id";
import { CompletePattern } from "../../shared/system/service/complete-pattern";
import { ServiceTransform } from "../service/transforms/transform";

export function getTimetableService(
  ctx: TrainQuery,
  id: StaticServiceIDComponents,
) {
  const timetable = ctx
    .getConfig()
    .server.timetables.find((t) => t.id === id.timetable);
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

  if (timetable.id !== getTimetableForDay(ctx, id.date, timetable.line)?.id) {
    // TODO: Instead of 404ing the page, we could show a warning that the
    // timetable is outdated.
    return null;
  }

  const service = specificize(ctx, entry, id.date);
  return service;
}

export async function getGtfsService(
  ctx: TrainQuery,
  id: GtfsServiceIDComponents,
  transforms: ServiceTransform<CompletePattern>[],
) {
  if (ctx.gtfs == null) {
    return null;
  }
  return _getGtfsService(ctx, id, await ctx.gtfs.getData(), transforms);
}

export function getGtfsServiceNoRealtime(
  ctx: TrainQuery,
  id: GtfsServiceIDComponents,
  transforms: ServiceTransform<CompletePattern>[],
) {
  if (ctx.gtfs == null) {
    return null;
  }
  return _getGtfsService(ctx, id, ctx.gtfs.getDataNoRealtime(), transforms);
}

function _getGtfsService(
  ctx: TrainQuery,
  id: GtfsServiceIDComponents,
  gtfsData: GtfsData | null,
  transforms: ServiceTransform<CompletePattern>[],
) {
  if (gtfsData == null) {
    return null;
  }

  const tripsForSubfeed = gtfsData.trips.filter(
    (t) => t.gtfsSubfeedID === id.subfeedID,
  );

  for (const trip of tripsForSubfeed) {
    const match = trip.idPairs.find(
      (p) =>
        p.gtfsTripID === id.gtfsTripID &&
        p.continuationIndex === id.continuationIndex,
    );

    if (match == null) {
      continue;
    }

    const calendar = gtfsData.calendars.find(
      (c) =>
        c.gtfsCalendarID === match.gtfsCalendarID &&
        c.gtfsSubfeedID === id.subfeedID,
    );
    if (calendar == null || !calendar.appliesOn(id.date)) {
      return null;
    }

    const service = specificizeGtfsTrip(
      ctx,
      trip,
      match.gtfsCalendarID,
      id.date,
      transforms,
    );
    return service;
  }

  return null;
}
