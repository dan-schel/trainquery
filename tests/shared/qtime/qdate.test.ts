import { expect, describe, it } from "vitest";
import { QDate } from "../../../shared/qtime/qdate";

describe("QDate", () => {
  describe("isValid", () => {
    it("should recognize leap years correctly", () => {
      expect(new QDate(2021, 2, 29).isValid().valid).toBe(false);
      expect(new QDate(2024, 2, 29).isValid().valid).toBe(true);
      expect(new QDate(2100, 2, 29).isValid().valid).toBe(false);
    });
  });
});
