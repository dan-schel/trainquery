import { nonNull } from "@dan-schel/js-utils";
import { QDate } from "../../../shared/qtime/qdate";
import { ErrorLogger } from "../../../shared/utils";
import { GtfsData } from "../data/gtfs-data";
import { GtfsRealtimeTrip } from "../data/gtfs-realtime-trip";
import { GtfsTrip, TimeWithSequenceNumber } from "../data/gtfs-trip";
import { GtfsRealtimeData } from "./fetch";
import { transit_realtime } from "./proto";
import { QTimetableTime } from "../../../shared/qtime/qtime";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { toLocalDateTimeLuxon } from "../../../shared/qtime/luxon-conversions";
import { HasSharedConfig } from "../../../shared/system/config-utils";
import Long from "long";

/** Enhance the scheduled GTFS data by enhancing trips with the realtime data. */
export function applyRealtimeData(
  config: HasSharedConfig,
  schedule: GtfsData,
  realtime: GtfsRealtimeData,
  gtfsSubfeedID: string | null,
  logError?: ErrorLogger,
): GtfsData {
  const timeUpdateError = (message: string) => {
    if (logError != null) {
      logError(message);
    }
    return null;
  };

  const liveTrips = schedule.trips.map((trip) => {
    const tripError = (message: string) => {
      if (logError != null) {
        logError(message);
      }

      // Note: Leave the trip as is (do not strip live data), because if we have
      // multiple subfeed, they'll each have their realtime data applied
      // one-by-one and we want it all to remain.
      return trip;
    };

    if (trip.gtfsSubfeedID !== gtfsSubfeedID) {
      // Note: Leave the trip as is (do not strip live data), because if we have
      // multiple subfeed, they'll each have their realtime data applied
      // one-by-one and we want it all to remain.
      return trip;
    }
    const matchingUpdate = getMatchingTripUpdate(trip, realtime);
    if (matchingUpdate == null) {
      // Note: Leave the trip as is (do not strip live data), because if we have
      // multiple subfeed, they'll each have their realtime data applied
      // one-by-one and we want it all to remain.
      return trip;
    }

    // Parse the date, making sure it's provided, and valid.
    if (matchingUpdate.trip.startDate == null) {
      return tripError("Missing start date in trip update.");
    }
    const liveDate = QDate.parse(matchingUpdate.trip.startDate);
    if (liveDate == null || !liveDate.isValid().valid) {
      return tripError("Invalid start date in trip update.");
    }

    const liveTimes: TimeWithSequenceNumber[] = matchingUpdate.stopTimeUpdate
      .map((timeUpdateRaw) => {
        const timeUpdate =
          transit_realtime.TripUpdate.StopTimeUpdate.create(timeUpdateRaw);
        const timeEventRaw = timeUpdate.departure ?? timeUpdate.arrival;
        if (timeEventRaw == null) {
          return timeUpdateError(
            "Departure and arrival time both not provided.",
          );
        }
        const timeEvent =
          transit_realtime.TripUpdate.StopTimeEvent.create(timeEventRaw);
        const timeUnixSecondsLong = timeEvent.time as number | Long;

        // TODO: Y2K38 bug here?
        const timeUnixSeconds =
          typeof timeUnixSecondsLong === "number"
            ? timeUnixSecondsLong
            : timeUnixSecondsLong.toNumber();

        const datetime = QUtcDateTime.fromUnixSeconds(timeUnixSeconds);
        const localDateTime = toLocalDateTimeLuxon(config, datetime);
        const timetableTime = QTimetableTime.fromDateTime(
          liveDate,
          localDateTime,
        );
        if (timetableTime == null) {
          return timeUpdateError(
            "Unix timestamp was not a reasonable timetable time.",
          );
        }

        return {
          sequence: timeUpdate.stopSequence,
          time: timetableTime,
        };
      })
      .filter(nonNull);

    return GtfsRealtimeTrip.enhance(trip, liveDate, liveTimes, false);
  });

  return schedule.withTrips(liveTrips);
}

function getMatchingTripUpdate(
  trip: GtfsTrip,
  realtime: GtfsRealtimeData,
): transit_realtime.TripUpdate | null {
  const tripUpdateRaw = realtime.tripUpdates.find((update) => {
    const tripDescriptor = transit_realtime.TripDescriptor.create(update.trip);
    return trip.idPairs.some((p) => p.gtfsTripID === tripDescriptor.tripId);
  });
  if (tripUpdateRaw == null) {
    return null;
  }
  return transit_realtime.TripUpdate.create(tripUpdateRaw);
}
