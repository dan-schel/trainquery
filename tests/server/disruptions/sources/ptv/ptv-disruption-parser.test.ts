import { assert, describe, expect, it } from "vitest";
import { QDate } from "../../../../../shared/qtime/qdate";
import { QUtcDateTime } from "../../../../../shared/qtime/qdatetime";
import { QTime } from "../../../../../shared/qtime/qtime";
import { toLineID, toStopID } from "../../../../../shared/system/ids";
import { PtvExternalDisruptionData } from "../../../../../shared/disruptions/external/types/ptv";
import { PtvDisruptionParser } from "../../../../../server/disruptions/provider/ptv/ptv-disruption-parser";
import { ExternalDisruptionData } from "../../../../../shared/disruptions/external/external-disruption-data";
import { GenericLineDisruptionData } from "../../../../../shared/disruptions/processed/types/generic-line";
import { GenericStopDisruptionData } from "../../../../../shared/disruptions/processed/types/generic-stop";
import { ParsingResults } from "../../../../../server/disruptions/provider/auto-disruption-parser";
import { ExternalDisruptionID } from "../../../../../shared/disruptions/external/external-disruption-id";

const busesLilydaleLine = new PtvExternalDisruptionData(
  311965,
  "Lilydale Line: Buses replace trains from 8.30pm Friday 24 May to early July 2024.",
  "Buses replace Lilydale Line trains between Ringwood and Lilydale from 8.30pm Friday 24 May to early July, due to works.",
  [toLineID(10)],
  [
    216, 171, 101, 253, 104, 224, 88, 43, 128, 116, 14, 45, 86, 47, 54, 316, 37,
    154, 34, 209, 181, 130, 226, 227, 73, 187, 159,
  ].map((x) => toStopID(x)),
  new QUtcDateTime(new QDate(2024, 5, 24), new QTime(10, 30, 0)),
  null,
  "https://ptv.vic.gov.au/live-travel-updates/article/lilydale-line-buses-replace-trains-from-8-30pm-friday-24-may-to-early-july-2024",
);

const carParkClosureUFG = new PtvExternalDisruptionData(
  311869,
  "Upper Ferntree Gully Station: Temporary car park closures from 4pm Sunday 12 May to 10pm Thursday 16 May 2024.",
  "Upper Ferntree Gully Station will be affected by temporary car park closures from 4pm Sunday 12 May to 10pm Thursday 16 May, due to works.",
  [toLineID(9)],
  [toStopID(282)],
  new QUtcDateTime(new QDate(2024, 5, 12), new QTime(6, 0, 0)),
  new QUtcDateTime(new QDate(2024, 5, 16), new QTime(10, 0, 0)),
  "https://ptv.vic.gov.au/live-travel-updates/article/upper-ferntree-gully-station-temporary-car-park-closures-from-4pm-sunday-12-may-to-10pm-thursday-16-may-2024",
);

const lineStations = new PtvExternalDisruptionData(
  218983,
  "Cranbourne and Pakenham line stations: Temporary car park closures and changes to pedestrian access until 2024.",
  "Stations on the Cranbourne and Pakenham lines will be affected by temporary car park closures and changes to pedestrian access at select times. These impacts are due to works as part of the Level Crossing Removal Project, Car Parks for Commuters program and other maintenance works.",
  [toLineID(4), toLineID(5)].map((x) => toLineID(x)),
  [198, 24, 69, 214, 174, 195, 74, 221].map((x) => toStopID(x)),
  new QUtcDateTime(new QDate(2020, 12, 14), new QTime(22, 57, 0)),
  null,
  "https://ptv.vic.gov.au/live-travel-updates/article/cranbourne-and-pakenham-line-stations-temporary-car-park-closures-and-changes-to-pedestrian-access-until-2022",
);

export class TestUnknownExternalDisruptionData extends ExternalDisruptionData {
  getID(): ExternalDisruptionID {
    throw new Error("Method not implemented.");
  }
  getSummary(): string {
    throw new Error("Method not implemented.");
  }
  getStarts(): QUtcDateTime | null {
    throw new Error("Method not implemented.");
  }
  getEnds(): QUtcDateTime | null {
    throw new Error("Method not implemented.");
  }
  matchesContent(_other: ExternalDisruptionData): boolean {
    throw new Error("Method not implemented.");
  }
}

const nonPtvType = new TestUnknownExternalDisruptionData();

describe("PtvDisruptionParser", () => {
  const parser = new PtvDisruptionParser();

  describe("process", () => {
    it("should ignore non-PTV disruptions", () => {
      expect(parser.process(nonPtvType)).toBeNull();
    });
    it("should create GenericLineDisruptionData when buses replace trains", () => {
      const resultArray = parser.process(busesLilydaleLine);
      const result = expectSingleDisruption(resultArray);
      expect(result).toBeInstanceOf(GenericLineDisruptionData);
    });
    it("should create GenericStopDisruptionData for car park closures", () => {
      const resultArray = parser.process(carParkClosureUFG);
      const result = expectSingleDisruption(resultArray);
      expect(result).toBeInstanceOf(GenericStopDisruptionData);
    });
    it('should create GenericStopDisruptionData for "... line stations:" disruptions', () => {
      const resultArray = parser.process(lineStations);
      const result = expectSingleDisruption(resultArray);
      expect(result).toBeInstanceOf(GenericStopDisruptionData);
    });
  });
});

function expectSingleDisruption(result: ParsingResults | null) {
  assert(result != null, "expected result to be non-null");
  expect(result.disruptions.length).toBe(1);
  return result.disruptions[0];
}
