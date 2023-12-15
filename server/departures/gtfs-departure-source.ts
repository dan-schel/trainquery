import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { getLine, linesThatStopAt } from "../../shared/system/config-utils";
import { StopID } from "../../shared/system/ids";
import { GtfsCalendar, GtfsData, GtfsTrip } from "../gtfs/gtfs-data";
import { TrainQuery } from "../trainquery";
import { DepartureSource } from "./departure-source";
import { SearchTimeRange, fetchAndSort } from "./search-time-range";

export type GtfsPossibility = {
  trip: GtfsTrip;
  gtfsCalendarID: string;
  date: QDate;
  perspectiveIndex: number;
};

export class GtfsDepartureSource extends DepartureSource<GtfsPossibility> {
  private _stop: StopID | null = null;
  private _relevantTrips: GtfsTrip[] | null = null;

  constructor(
    ctx: TrainQuery,
    private readonly _gtfsData: GtfsData,
  ) {
    super(ctx);
  }

  prepare(stop: StopID): void {
    this._stop = stop;

    const lines = linesThatStopAt(this._ctx.getConfig(), stop).map((l) => l.id);
    this._relevantTrips = this._gtfsData.trips.filter((t) =>
      lines.includes(t.line),
    );
  }

  async fetch(
    time: QUtcDateTime,
    iteration: number,
    reverse: boolean,
  ): Promise<GtfsPossibility[]> {
    if (this._stop == null || this._relevantTrips == null) {
      throw new Error("Call prepare before fetch.");
    }
    const stop = this._stop;
    const trips = this._relevantTrips;

    return await fetchAndSort(this._ctx, time, iteration, reverse, async (t) =>
      getForSearchTime(this._ctx, this._gtfsData.calendars, trips, stop, t),
    );
  }

  isIterable(): boolean {
    return true;
  }
}

function getForSearchTime(
  ctx: TrainQuery,
  calendars: GtfsCalendar[],
  trips: GtfsTrip[],
  stop: StopID,
  searchTime: SearchTimeRange,
) {
  const result: (GtfsPossibility & { sortTime: number })[] = [];

  const calendarsThatApply = calendars.filter((c) =>
    c.appliesOn(searchTime.date),
  );

  for (const trip of trips) {
    const applicableCalendar =
      trip.idPairs.find((i) =>
        calendarsThatApply.some(
          (c) =>
            c.gtfsSubfeedID == trip.gtfsSubfeedID &&
            c.gtfsCalendarID == i.gtfsCalendarID,
        ),
      ) ?? null;

    if (applicableCalendar == null) {
      continue;
    }

    const isVetoed = calendarsThatApply.some(
      (c) =>
        c.gtfsSubfeedID == trip.gtfsSubfeedID &&
        trip.vetoedCalendars.has(c.gtfsCalendarID),
    );

    if (isVetoed) {
      continue;
    }

    // Line or stop list coming from GTFS data cannot be trusted to always be
    // valid, since different route and direction names might change or lines
    // might be removed over time.
    //
    // TODO: This issue could be avoided by saving the config hash with the GTFS
    // metadata, and refusing to load GTFS data when the hashes do not match.
    // This is also another good reason to include server-only config data in
    // the hash calculation, because what if the continuation rules change, for
    // example.
    const line = getLine(ctx.getConfig(), trip.line);
    if (line == null) {
      continue;
    }
    const stopList = line.route.getStopList(trip.route, trip.direction);
    if (stopList == null) {
      continue;
    }

    for (let i = 0; i < stopList.stops.length; i++) {
      if (stopList.stops[i] != stop) {
        continue;
      }
      const time = trip.times[i];
      if (time == null) {
        continue;
      }
      if (time.isWithin(searchTime.min, searchTime.max)) {
        result.push({
          trip: trip,
          date: searchTime.date,
          gtfsCalendarID: applicableCalendar.gtfsCalendarID,
          sortTime: searchTime.getSortTime(time),
          perspectiveIndex: i,
        });
      }
    }
  }

  return result;
}
