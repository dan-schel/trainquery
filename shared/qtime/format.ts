import { hour24To12 } from "@dan-schel/js-utils";
import { getMonthAcronym, type QDate } from "./qdate";
import type { QLocalDateTime } from "./qdatetime";
import { QDayOfWeek } from "./qdayofweek";
import type { QDuration } from "./qduration";
import type { QTime } from "./qtime";

export function formatTime(
  time: QTime,
  { includeSeconds = false }: { includeSeconds?: boolean } = {},
) {
  const hour12 = hour24To12(time.hour);
  const hrs = hour12.hour.toFixed();
  const mins = time.minute.toFixed().padStart(2, "0");
  const half = hour12.half;
  if (includeSeconds) {
    const secs = time.second.toFixed().padStart(2, "0");
    return `${hrs}:${mins}:${secs}${half}`;
  }
  return `${hrs}:${mins}${half}`;
}

export function formatDuration(
  duration: QDuration,
  { round = false }: { round?: boolean } = {},
) {
  const { d, h, m, s } = duration.positiveComponents;
  const components = [];
  if (d !== 0) {
    components.push(d === 1 ? "1 day" : `${d.toFixed()} days`);
  }
  if (h !== 0) {
    components.push(h === 1 ? "1 hr" : `${h.toFixed()} hrs`);
  }
  if (m !== 0) {
    components.push(m === 1 ? "1 min" : `${m.toFixed()} mins`);
  }
  if (s !== 0 || components.length === 0) {
    components.push(s === 1 ? "1 sec" : `${s.toFixed()} secs`);
  }

  if (round) {
    components.splice(1, components.length - 1);
  }
  return components.join(", ") + (duration.isNegative ? " ago" : "");
}

export function formatDate(date: QDate) {
  const dow = QDayOfWeek.fromDate(date).toAcronym();
  const month = getMonthAcronym(date.month);
  return `${dow}, ${date.day.toFixed()} ${month}`;
}

export function formatRelativeTime(
  time: QLocalDateTime,
  now: QLocalDateTime,
  { suppressEarlierToday = false }: { suppressEarlierToday?: boolean } = {},
) {
  const timeString = formatTime(time.time);
  const dayDiff = time.date.diff(now.date);

  if (dayDiff === 0) {
    return time.isBefore(now) && !suppressEarlierToday
      ? `${timeString} earlier today`
      : timeString;
  } else if (dayDiff === 1) {
    return time.time.hour <= 2
      ? `${timeString} tonight`
      : `${timeString} tomorrow`;
  } else if (dayDiff === -1) {
    return `${timeString} yesterday`;
  } else if (dayDiff > 1 && dayDiff < 7) {
    return `${timeString} ${QDayOfWeek.fromDate(time.date).toName()}`;
  } else if (dayDiff < -1 && dayDiff > -7) {
    return `${timeString} last ${QDayOfWeek.fromDate(time.date).toName()}`;
  } else {
    return `${timeString} (${formatDate(time.date)})`;
  }
}

export function formatDateTime(dateTime: QLocalDateTime) {
  return `${formatDate(dateTime.date)} at ${formatTime(dateTime.time)}`;
}
