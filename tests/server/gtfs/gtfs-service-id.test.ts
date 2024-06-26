import { expect, describe, it } from "vitest";
import { GtfsServiceIDComponents } from "../../../server/gtfs/gtfs-service-id";
import { QDate } from "../../../shared/qtime/qdate";

describe("GtfsServiceIDComponents", () => {
  describe("encode", () => {
    it("should the expected encoded string", () => {
      expect(
        new GtfsServiceIDComponents(
          "29.T0.1-V48-mjp-6.8.R",
          0,
          "regional",
          new QDate(2024, 3, 13),
        ).encode(),
      ).toBe("BVJTPScNN4hF4qVNwTRwdVPwg5fhKCKXdnQNZXs6Lm4L7NpmgMP");
    });
  });
  describe("decode", () => {
    it("should parse an encoded string to the expected values", () => {
      const encoded = "BVJTPScNN4hF4qVNwTRwdVPwg5fhKCKXdnQNZXs6Lm4L7NpmgMP";
      const decoded = GtfsServiceIDComponents.decode(encoded);
      expect(decoded?.gtfsTripID).toEqual("29.T0.1-V48-mjp-6.8.R");
      expect(decoded?.continuationIndex).toEqual(0);
      expect(decoded?.subfeedID).toEqual("regional");
      expect(decoded?.date.toISO({ useDashes: false })).toEqual("20240313");
    });
  });
});
