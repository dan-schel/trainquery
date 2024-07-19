import { describe, expect, it } from "vitest";
import { IgnoreStopsRules } from "../../../server/config/gtfs-config";
import { toStopID } from "../../../shared/system/ids";

describe("IgnoreStopsRules", () => {
  describe("applies", () => {
    it("correctly checks for the present of entries in ifPresent", () => {
      const rules = new IgnoreStopsRules(toStopID(1), [toStopID(3)]);
      expect(rules.applies([toStopID(1), toStopID(2)])).toBe(false);
      expect(rules.applies([toStopID(1), toStopID(3)])).toBe(true);
    });
    it("requires all entries in ifPresent to be present", () => {
      const rules = new IgnoreStopsRules(toStopID(1), [
        toStopID(2),
        toStopID(3),
      ]);
      expect(rules.applies([toStopID(1), toStopID(2)])).toBe(false);
      expect(rules.applies([toStopID(2), toStopID(3)])).toBe(true);
    });
    it("returns true when ifPresent is empty", () => {
      const rules = new IgnoreStopsRules(toStopID(1), []);
      expect(rules.applies([toStopID(1), toStopID(2)])).toBe(true);
    });
  });
});
