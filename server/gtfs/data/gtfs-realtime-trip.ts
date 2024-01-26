import { QDate } from "../../../shared/qtime/qdate";
import {
  LineID,
  RouteVariantID,
  DirectionID,
} from "../../../shared/system/ids";
import { GtfsTrip, GtfsTripIDPair, TimeWithSequenceNumber } from "./gtfs-trip";

export class GtfsRealtimeTrip extends GtfsTrip {
  constructor(
    idPairs: GtfsTripIDPair[],
    gtfsSubfeedID: string | null,
    vetoedCalendars: Set<string>,
    line: LineID,
    route: RouteVariantID,
    direction: DirectionID,

    // Note that the scheduled times are still provided, not just the live
    // times. This is firstly because we want to be able to compare them ("how
    // many minutes delayed is the service?"), but secondly because when cast as
    // a GtfsTrip, the realtime data should be completely stripped away.
    times: (TimeWithSequenceNumber | null)[],

    /**
     * The date the live data is provided for. Departures scheduled on dates
     * besides this one should ignore the {@link liveTimes} and
     * {@link isCancelled} fields.
     */
    readonly liveDate: QDate,
    readonly liveTimes: (TimeWithSequenceNumber | null)[],
    readonly isCancelled: boolean,
  ) {
    super(
      idPairs,
      gtfsSubfeedID,
      vetoedCalendars,
      line,
      route,
      direction,
      times,
    );
  }

  /** Enhance a {@link GtfsTrip} with realtime data. */
  static enhance(
    trip: GtfsTrip,
    liveDate: QDate,
    liveTimes: TimeWithSequenceNumber[],
    isCancelled: boolean,
  ): GtfsRealtimeTrip {
    // Start with the scheduled times, and replace those that have live times
    // provided, leaving the rest as is.
    const completeLiveTimes = trip.times.map((t) => {
      if (t == null) {
        return null;
      }
      const liveTime = liveTimes.find((lt) => lt.sequence === t.sequence);
      return liveTime ?? t;
    });

    return new GtfsRealtimeTrip(
      trip.idPairs,
      trip.gtfsSubfeedID,
      trip.vetoedCalendars,
      trip.line,
      trip.route,
      trip.direction,
      trip.times,
      liveDate,
      completeLiveTimes,
      isCancelled,
    );
  }

  static isRealtime(x: GtfsTrip): x is GtfsRealtimeTrip {
    return "liveDate" in x;
  }
}
