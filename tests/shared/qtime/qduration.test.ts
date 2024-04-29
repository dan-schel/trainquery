import { expect, test } from "vitest";
import { QDuration } from "../../../shared/qtime/qduration";

test("QDuration.components", () => {
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
  expect(new QDuration({ s: -70 }).components).toStrictEqual({
    d: -0,
    h: -0,
    m: -1,
    s: -10,
  });
});
