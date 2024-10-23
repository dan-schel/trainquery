import { expect, describe, it } from "vitest";
import {
  formatTime,
  formatDuration,
  formatDate,
  formatRelativeTime,
  formatDateTime,
} from "../../../shared/qtime/format";
import { QTime } from "../../../shared/qtime/qtime";
import { QDuration } from "../../../shared/qtime/qduration";
import { QDate } from "../../../shared/qtime/qdate";
import { QLocalDateTime } from "../../../shared/qtime/qdatetime";

describe("formatTime", () => {
  it("formats correctly", () => {
    const time1 = new QTime(20, 15, 25);
    expect(formatTime(time1)).toBe("8:15pm");
    expect(formatTime(time1, { includeSeconds: true })).toBe("8:15:25pm");
  });
});

describe("formatDuration", () => {
  it("formats correctly", () => {
    const duration1 = new QDuration({ d: 2, h: 1, m: 52, s: 12 });
    expect(formatDuration(duration1)).toBe("2 days, 1 hr, 52 mins, 12 secs");
    expect(formatDuration(duration1, { round: true })).toBe("2 days");

    const duration2 = new QDuration({ m: 52, s: 59 });
    expect(formatDuration(duration2)).toBe("52 mins, 59 secs");
    expect(formatDuration(duration2, { round: true })).toBe("52 mins");
  });
});

describe("formatDate", () => {
  it("formats correctly", () => {
    const date1 = new QDate(2024, 10, 23);
    expect(formatDate(date1)).toBe("Wed, 23 Oct");
    expect(formatDate(date1, { includeYear: true })).toBe("Wed, 23 Oct 2024");
  });
});

describe("formatRelativeTime", () => {
  it("formats correctly", () => {
    const oct23rd = new QDate(2024, 10, 23);
    const oct22nd = new QDate(2024, 10, 22);
    const oct16th = new QDate(2024, 10, 16);
    const oct15th = new QDate(2024, 10, 15);
    const oct24th = new QDate(2024, 10, 24);
    const oct29th = new QDate(2024, 10, 29);
    const oct30th = new QDate(2024, 10, 30);
    const t8_23pm = new QTime(20, 23, 25);
    const t8_23am = new QTime(8, 23, 25);
    const t11_56pm = new QTime(23, 56, 0);
    const t1_23am = new QTime(1, 23, 25);

    const now = new QLocalDateTime(oct23rd, t8_23pm, 11);
    const date1 = new QLocalDateTime(oct23rd, t8_23pm, 11);
    const date2 = new QLocalDateTime(oct23rd, t8_23am, 11);
    const date3 = new QLocalDateTime(oct22nd, t11_56pm, 11);
    const date4 = new QLocalDateTime(oct16th, t8_23am, 11);
    const date5 = new QLocalDateTime(oct15th, t11_56pm, 11);
    const date6 = new QLocalDateTime(oct24th, t1_23am, 11);
    const date7 = new QLocalDateTime(oct24th, t8_23am, 11);
    const date8 = new QLocalDateTime(oct29th, t8_23am, 11);
    const date9 = new QLocalDateTime(oct30th, t8_23am, 11);

    const opts = { suppressEarlierToday: true };

    expect(formatRelativeTime(date1, now)).toBe("8:23pm");
    expect(formatRelativeTime(date2, now)).toBe("8:23am earlier today");
    expect(formatRelativeTime(date2, now, opts)).toBe("8:23am");
    expect(formatRelativeTime(date3, now)).toBe("11:56pm yesterday");
    expect(formatRelativeTime(date3, now, opts)).toBe("11:56pm yesterday");
    expect(formatRelativeTime(date4, now, opts)).toBe("8:23am last Wednesday");
    expect(formatRelativeTime(date5, now)).toBe("11:56pm (Tue, 15 Oct)");
    expect(formatRelativeTime(date6, now)).toBe("1:23am tonight");
    expect(formatRelativeTime(date7, now)).toBe("8:23am tomorrow");
    expect(formatRelativeTime(date8, now)).toBe("8:23am Tuesday");
    expect(formatRelativeTime(date9, now)).toBe("8:23am (Wed, 30 Oct)");
  });
});

describe("formatDateTime", () => {
  it("formats correctly", () => {
    const date1 = new QLocalDateTime(
      new QDate(2024, 10, 23),
      new QTime(20, 33, 30),
      11,
    );

    expect(formatDateTime(date1)).toBe("Wed, 23 Oct at 8:33pm");
    expect(
      formatDateTime(date1, { includeSeconds: true, includeYear: true }),
    ).toBe("Wed, 23 Oct 2024 at 8:33:30pm");
  });
});
