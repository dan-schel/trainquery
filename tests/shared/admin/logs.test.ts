import { expect, describe, it } from "vitest";
import { AdminLog } from "../../../shared/admin/logs";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { QTime } from "../../../shared/qtime/qtime";
import { QDate } from "../../../shared/qtime/qdate";

describe("AdminLog", () => {
  describe("toMongo", () => {
    it("should give the date as JS Date object", () => {
      expect(
        new AdminLog(
          "1",
          0,
          "info",
          null,
          "something",
          new QUtcDateTime(new QDate(2024, 6, 30), new QTime(3, 50, 0)),
        ).toMongo().timestamp,
      ).toStrictEqual(new Date("2024-06-30T03:50:00.000Z"));
    });
  });
});
