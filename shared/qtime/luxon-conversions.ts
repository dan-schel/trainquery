import { DateTime } from "luxon";
import { QDate } from "./qdate";
import { type HasSharedConfig } from "../system/config-utils";
import { QLocalDateTime, QUtcDateTime } from "./qdatetime";
import { QTime } from "./qtime";

export function getOffsetLuxon(
  date: QDate,
  zoneID: string,
  offsetCheckHour: number,
) {
  const localTime = DateTime.local(
    date.year,
    date.month,
    date.day,
    offsetCheckHour,
    0,
    0,
    { zone: zoneID },
  );
  const utcTime = localTime.toUTC();
  const offsetUtc = localTime.setZone("utc", { keepLocalTime: true });
  return offsetUtc.diff(utcTime).as("hours");
}

export function toLocalDateTimeLuxon(
  config: HasSharedConfig,
  input: QUtcDateTime,
): QLocalDateTime {
  if ("offset" in config.shared.timezone) {
    const offset = config.shared.timezone.offset;
    const offsetTime = input.time.add({ h: offset });
    return new QLocalDateTime(
      input.date.addDays(offsetTime.days),
      offsetTime.time,
      offset,
    );
  }

  const luxonUTC = DateTime.utc(
    input.date.year,
    input.date.month,
    input.date.day,
    input.time.hour,
    input.time.minute,
    input.time.second,
  );
  const converted = luxonUTC.setZone(config.shared.timezone.id);
  const offsetLocal = luxonUTC.setZone(config.shared.timezone.id, {
    keepLocalTime: true,
  });
  const offset = converted.diff(offsetLocal).as("hours");

  const convertedDate = new QDate(
    converted.year,
    converted.month,
    converted.day,
  );
  const convertedTime = new QTime(
    converted.hour,
    converted.minute,
    converted.second,
  );
  return new QLocalDateTime(convertedDate, convertedTime, offset);
}

export function nowUTC(): QUtcDateTime {
  const now = new Date();
  return new QUtcDateTime(
    new QDate(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate()),
    new QTime(now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()),
  );
}

export function nowLocalLuxon(config: HasSharedConfig): QLocalDateTime {
  return toLocalDateTimeLuxon(config, nowUTC());
}

export function buildLocalDateTimeLuxon(
  config: HasSharedConfig,
  date: QDate,
  time: QTime,
): QLocalDateTime {
  if ("offset" in config.shared.timezone) {
    const offset = config.shared.timezone.offset;
    return new QLocalDateTime(date, time, offset);
  }

  const offset =
    DateTime.local(
      date.year,
      date.month,
      date.day,
      time.hour,
      time.minute,
      time.second,
      { zone: config.shared.timezone.id },
    ).offset / 60;
  return new QLocalDateTime(date, time, offset);
}
