import { expect, describe, it } from "vitest";
import { getOffsetLuxon } from "../../../shared/qtime/luxon-conversions";
import { QDate } from "../../../shared/qtime/qdate";

describe("getOffsetLuxon", () => {
  it("works correctly", () => {
    const zone = "Australia/Melbourne";

    // AEDT ends on the first Sunday of April.
    expect(getOffsetLuxon(new QDate(2024, 4, 6), zone, 12)).toBe(11);
    expect(getOffsetLuxon(new QDate(2024, 4, 7), zone, 12)).toBe(10);

    // AEDT starts on the first Sunday of October.
    expect(getOffsetLuxon(new QDate(2024, 10, 5), zone, 12)).toBe(10);
    expect(getOffsetLuxon(new QDate(2024, 10, 6), zone, 12)).toBe(11);
  });
});
