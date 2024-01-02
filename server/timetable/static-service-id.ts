import {
  base48Safe,
  decimal,
  parseIntNull,
  reencode,
  tryReencode,
} from "@schel-d/js-utils";
import { QDate } from "../../shared/qtime/qdate";
import {
  StaticServiceID,
  TimetableID,
  isTimetableID,
  toStaticServiceID,
} from "../../shared/system/ids";

const encodedAlpha = decimal + "|";

export class StaticServiceIDComponents {
  constructor(
    readonly timetable: TimetableID,
    readonly index: number,
    readonly date: QDate,
  ) {}

  asString() {
    return (
      this.timetable.toFixed() +
      "|" +
      this.index.toFixed() +
      "|" +
      this.date.toISO({ useDashes: false })
    );
  }
  static parse(input: string): StaticServiceIDComponents | null {
    const components = input.split("|");
    if (components.length !== 3) {
      return null;
    }

    const timetable = parseIntNull(components[0]);
    const index = parseIntNull(components[1]);
    const date = QDate.parse(components[2]);
    if (timetable == null || !isTimetableID(timetable)) {
      return null;
    }
    if (index == null || index < 0) {
      return null;
    }
    if (date == null || !date.isValid()) {
      return null;
    }

    return new StaticServiceIDComponents(timetable, index, date);
  }

  encode(): StaticServiceID {
    return toStaticServiceID(
      reencode(this.asString(), encodedAlpha, base48Safe),
    );
  }
  static decode(
    input: string | StaticServiceID,
  ): StaticServiceIDComponents | null {
    const decodedString = tryReencode(input, base48Safe, encodedAlpha);
    if (decodedString == null) {
      return null;
    }
    return StaticServiceIDComponents.parse(decodedString);
  }
}
