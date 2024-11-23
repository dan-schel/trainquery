import { expect, describe, it } from "vitest";
import { QDuration } from "../../../shared/qtime/qduration";

describe("QDuration", () => {
  describe("components", () => {
    it("should break seconds down into larger increments", () => {
      expect(new QDuration({ s: 30 }).components).toStrictEqual({
        d: 0,
        h: 0,
        m: 0,
        s: 30,
      });
      expect(new QDuration({ s: 60 }).components).toStrictEqual({
        d: 0,
        h: 0,
        m: 1,
        s: 0,
      });
      expect(new QDuration({ s: 365 }).components).toStrictEqual({
        d: 0,
        h: 0,
        m: 6,
        s: 5,
      });
    });
    it("should handle negative durations", () => {
      expect(new QDuration({ s: -70 }).components).toStrictEqual({
        d: -0,
        h: -0,
        m: -1,
        s: -10,
      });
      expect(new QDuration({ h: 30, s: -70 }).components).toStrictEqual({
        d: 1,
        h: 5,
        m: 58,
        s: 50,
      });
    });
  });
});
