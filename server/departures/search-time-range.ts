import { QDate } from "../../shared/qtime/qdate";
import { QUtcDateTime, toUTCDateTime } from "../../shared/qtime/qdatetime";
import { QTime, QTimetableTime } from "../../shared/qtime/qtime";
import { TrainQuery } from "../ctx/trainquery";

const iterationSizeHours = 24;

export type SearchTimeRange = {
  /** The timetabled date to search within. */
  date: QDate;
  min: QTimetableTime | null;
  max: QTimetableTime | null;
  /**
   * Converts the timetabled time to a time value that can be used to sorting
   * (ideally resembles UTC to sort services from days with different offsets
   * correctly, but only has to worry about sorting within the same iteration).
   */
  getSortTime: (time: QTimetableTime) => number;
};

export function getSearchTimes(
  ctx: TrainQuery,
  time: QUtcDateTime,
  iteration: number,
  reverse: boolean,
): SearchTimeRange[] {
  const blockOffset = !reverse ? iteration : -1 - iteration;
  const start = time.add({ h: iterationSizeHours * blockOffset });
  const end = time.add({ h: iterationSizeHours * (blockOffset + 1) });

  // TODO: this could be generic (so it works with all timey-type types), and
  // available as an exported function in another file.
  const getOverlap = (
    start1: QUtcDateTime,
    end1: QUtcDateTime,
    start2: QUtcDateTime,
    end2: QUtcDateTime,
  ) => {
    if (end1.isBeforeOrEqual(start2)) {
      return null;
    }
    if (end2.isBeforeOrEqual(start1)) {
      return null;
    }
    return {
      start: start1.isAfter(start2) ? start1 : start2,
      end: end1.isBefore(end2) ? end1 : end2,
    };
  };

  // Services can depart up to 48 hours after a day begins, and timezones can
  // have up to a 24 hour offset (14 in reality, but let's be cautious).
  const surroundingHours = 48 + 24;
  const surroundingDays = Math.ceil(surroundingHours / 24);
  const result: SearchTimeRange[] = [];

  // TODO: double check we're definitely getting the right range of days.
  for (let i = -surroundingDays; i <= surroundingDays; i++) {
    const date = start.date.addDays(i);
    const offset = ctx.getConfig().computed.offset.get(date);

    const dayStart = new QUtcDateTime(date, new QTime(0, 0, 0)).add({
      h: -offset,
    });
    const dayEnd = dayStart.add({ h: QTimetableTime.getNumOfHours() });
    const overlap = getOverlap(dayStart, dayEnd, start, end);

    if (overlap != null) {
      result.push({
        date: date,
        min: QTimetableTime.fromDuration(overlap.start.diff(dayStart)),
        max: QTimetableTime.fromDuration(overlap.end.diff(dayStart)),
        getSortTime: (time) => toUTCDateTime(date, time, offset).asDecimal(),
      });
    }
  }

  return result;
}

export async function fetchAndSort<A>(
  ctx: TrainQuery,
  time: QUtcDateTime,
  iteration: number,
  reverse: boolean,
  fetch: (searchTime: SearchTimeRange) => Promise<(A & { sortTime: number })[]>,
) {
  const result: (A & { sortTime: number })[] = [];
  for (const searchTime of getSearchTimes(ctx, time, iteration, reverse)) {
    result.push(...(await fetch(searchTime)));
  }

  result.sort((a, b) => (reverse ? -1 : 1) * (a.sortTime - b.sortTime));
  return result;
}
