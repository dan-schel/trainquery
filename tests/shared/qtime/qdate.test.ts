import { expect, test } from "vitest";
import { QDate } from "../../../shared/qtime/qdate";

test("QDate.isValid", () => {
  expect(new QDate(2021, 2, 29).isValid().valid).toBe(false);
  expect(new QDate(2024, 2, 29).isValid().valid).toBe(true);
  expect(new QDate(2100, 2, 29).isValid().valid).toBe(false);
});
