import { assert, describe, expect, it } from "vitest";
import { PtvDisruptionParser } from "../../../../../server/disruptions/sources/ptv/ptv-disruption-parser";
import { GenericLineDisruption } from "../../../../../shared/disruptions/types/generic-line-disruption";
import { Disruption } from "../../../../../shared/disruptions/disruption";
import { GenericStopDisruption } from "../../../../../shared/disruptions/types/generic-stop-disruption";
import {
  ProposedDisruption,
  ProposedDisruptionID,
} from "../../../../../shared/disruptions/proposed/proposed-disruption";
import { PtvProposedDisruption } from "../../../../../shared/disruptions/proposed/types/ptv-proposed-disruption";
import { QDate } from "../../../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../../../shared/qtime/qdatetime";
import { QTime } from "../../../../../shared/qtime/qtime";
import { toLineID, toStopID } from "../../../../../shared/system/ids";
import { HasSharedConfig } from "../../../../../shared/system/config-utils";

const busesLilydaleLine = new PtvProposedDisruption(
  new ProposedDisruptionID("ptv", "311965"),
  new QUtcDateTime(new QDate(2024, 5, 24), new QTime(10, 30, 0)),
  null,
  "Lilydale Line: Buses replace trains from 8.30pm Friday 24 May to early July 2024.",
  "Buses replace Lilydale Line trains between Ringwood and Lilydale from 8.30pm Friday 24 May to early July, due to works.",
  [toLineID(10)],
  [
    216, 171, 101, 253, 104, 224, 88, 43, 128, 116, 14, 45, 86, 47, 54, 316, 37,
    154, 34, 209, 181, 130, 226, 227, 73, 187, 159,
  ].map((x) => toStopID(x)),
  "https://ptv.vic.gov.au/live-travel-updates/article/lilydale-line-buses-replace-trains-from-8-30pm-friday-24-may-to-early-july-2024",
);

const carParkClosureUFG = new PtvProposedDisruption(
  new ProposedDisruptionID("ptv", "311869"),
  new QUtcDateTime(new QDate(2024, 5, 12), new QTime(6, 0, 0)),
  new QUtcDateTime(new QDate(2024, 5, 16), new QTime(10, 0, 0)),
  "Upper Ferntree Gully Station: Temporary car park closures from 4pm Sunday 12 May to 10pm Thursday 16 May 2024.",
  "Upper Ferntree Gully Station will be affected by temporary car park closures from 4pm Sunday 12 May to 10pm Thursday 16 May, due to works.",
  [toLineID(9)],
  [toStopID(282)],
  "https://ptv.vic.gov.au/live-travel-updates/article/upper-ferntree-gully-station-temporary-car-park-closures-from-4pm-sunday-12-may-to-10pm-thursday-16-may-2024",
);

const lineStations = new PtvProposedDisruption(
  new ProposedDisruptionID("ptv", "218983"),
  new QUtcDateTime(new QDate(2020, 12, 14), new QTime(22, 57, 0)),
  null,
  "Cranbourne and Pakenham line stations: Temporary car park closures and changes to pedestrian access until 2024.",
  "Stations on the Cranbourne and Pakenham lines will be affected by temporary car park closures and changes to pedestrian access at select times. These impacts are due to works as part of the Level Crossing Removal Project, Car Parks for Commuters program and other maintenance works.",
  [toLineID(4), toLineID(5)].map((x) => toLineID(x)),
  [198, 24, 69, 214, 174, 195, 74, 221].map((x) => toStopID(x)),
  "https://ptv.vic.gov.au/live-travel-updates/article/cranbourne-and-pakenham-line-stations-temporary-car-park-closures-and-changes-to-pedestrian-access-until-2022",
);

export class TestUnknownProposedDisruption extends ProposedDisruption {
  constructor() {
    super(
      "test-unknown",
      new ProposedDisruptionID("test-unknown", "0"),
      "Test",
      null,
      null,
      "",
    );
  }
  getMarkdown(_config: HasSharedConfig): string {
    throw new Error("Method not implemented.");
  }
}

const nonPtvType = new TestUnknownProposedDisruption();

describe("PtvDisruptionParser", () => {
  const parser = new PtvDisruptionParser();

  describe("process", () => {
    it("should ignore non-PTV disruptions", () => {
      expect(parser.process(nonPtvType)).toBeNull();
    });
    it("should create a single disruption with the source set correctly", () => {
      const resultArray = parser.process(busesLilydaleLine);
      const result = expectSingleDisruption(resultArray);
      expect(result.sources.length).toBe(1);
      assert(
        result.sources[0].equals(busesLilydaleLine.id),
        "expected source to match proposal's ID",
      );
    });
    it("should create a GenericLineDisruption when buses replace trains", () => {
      const resultArray = parser.process(busesLilydaleLine);
      const result = expectSingleDisruption(resultArray);
      expect(result).toBeInstanceOf(GenericLineDisruption);
    });
    it("should create a GenericStopDisruption for car park closures", () => {
      const resultArray = parser.process(carParkClosureUFG);
      const result = expectSingleDisruption(resultArray);
      expect(result).toBeInstanceOf(GenericStopDisruption);
    });
    it('should create a GenericStopDisruption for "... line stations:" disruptions', () => {
      const resultArray = parser.process(lineStations);
      const result = expectSingleDisruption(resultArray);
      expect(result).toBeInstanceOf(GenericStopDisruption);
    });
  });
});

function expectSingleDisruption(result: Disruption[] | null) {
  assert(result != null, "expected result to be non-null");
  expect(result.length).toBe(1);
  return result[0];
}
