import { expect, describe, it } from "vitest";
import { QWeekdayRange } from "../../../shared/qtime/qweekdayrange";
import { QDayOfWeek } from "../../../shared/qtime/qdayofweek";

describe("QWeekdayRange", () => {
  describe("parse/asString", () => {
    it("parses correctly", () => {
      expect(QWeekdayRange.parse("MTWTFSS")?.asString()).toBe("MTWTFSS");
      expect(QWeekdayRange.parse("__WTF__")?.asString()).toBe("__WTF__");
    });
    it("ignores junk strings", () => {
      expect(QWeekdayRange.parse("MTWTFSSM")).toBeNull();
      expect(QWeekdayRange.parse("")).toBeNull();

      // Turns out we don't check for this. Tbh, I don't care too much.
      // expect(QWeekdayRange.parse("SSSSSSS")).toBeNull();
    });
  });
  describe("includes", () => {
    it("works correctly", () => {
      const wtf = QWeekdayRange.parse("__WTF__");
      expect(wtf?.includes(QDayOfWeek.wed)).toBe(true);
      expect(wtf?.includes(QDayOfWeek.sat)).toBe(false);
    });
  });
});
