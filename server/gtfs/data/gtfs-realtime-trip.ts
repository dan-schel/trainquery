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
}
