import { DateTime } from "luxon";
import { QDate } from "./qdate";
import { type HasSharedConfig } from "../system/config-utils";
import { QLocalDateTime, QUtcDateTime } from "./qdatetime";
import { QTime } from "./qtime";

export function getOffset(
  date: QDate,
  zoneID: string,
  offsetCheckHour: number
) {
  const localTime = DateTime.local(
    date.year,
    date.month,
    date.day,
    offsetCheckHour,
    0,
    0,
    { zone: zoneID }
  );
  const utcTime = localTime.toUTC();
  const offsetUtc = localTime.setZone("utc", { keepLocalTime: true });
  return offsetUtc.diff(utcTime).as("hours");
}

export function toLocalDateTimeLuxon(
  config: HasSharedConfig,
  input: QUtcDateTime
): QLocalDateTime {
  if ("offset" in config.shared.timezone) {
    const offset = config.shared.timezone.offset;
    const offsetTime = input.time.add({ h: offset });
    return new QLocalDateTime(
      input.date.addDays(offsetTime.days),
      offsetTime.time,
      offset
    );
  }

  const luxonUTC = DateTime.utc(
    input.date.year,
    input.date.month,
    input.date.day,
    input.time.hour,
    input.time.minute,
    input.time.second
  );
  const converted = luxonUTC.setZone(config.shared.timezone.id);
  const offsetLocal = luxonUTC.setZone(config.shared.timezone.id, {
    keepLocalTime: true,
  });
  const offset = converted.diff(offsetLocal).as("hours");

  const convertedDate = new QDate(
    converted.year,
    converted.month,
    converted.day
  );
  const convertedTime = new QTime(
    converted.hour,
    converted.minute,
    converted.second
  );
  return new QLocalDateTime(convertedDate, convertedTime, offset);
}

export function nowUTCLuxon(): QUtcDateTime {
  const now = DateTime.utc();
  return new QUtcDateTime(
    new QDate(now.year, now.month, now.day),
    new QTime(now.hour, now.minute, now.second)
  );
}

export function nowLocalLuxon(config: HasSharedConfig): QLocalDateTime {
  return toLocalDateTimeLuxon(config, nowUTCLuxon());
}