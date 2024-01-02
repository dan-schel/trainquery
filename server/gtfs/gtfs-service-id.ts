import {
  base48Safe,
  parseIntNull,
  reencode,
  tryReencode,
} from "@schel-d/js-utils";
import { QDate } from "../../shared/qtime/qdate";

const encodedAlpha = "0123456789abcdef|";

export class GtfsServiceIDComponents {
  constructor(
    readonly gtfsTripID: string,
    readonly continuationIndex: number,
    readonly subfeedID: string | null,
    readonly date: QDate,
  ) {}

  asString() {
    return (
      Buffer.from(this.gtfsTripID).toString("hex") +
      "|" +
      this.continuationIndex.toFixed() +
      "|" +
      Buffer.from(this.subfeedID ?? "").toString("hex") +
      "|" +
      this.date.toISO({ useDashes: false })
    );
  }
  static parse(input: string): GtfsServiceIDComponents | null {
    const components = input.split("|");
    if (components.length !== 4) {
      return null;
    }

    if (
      !/^[0-9a-f]+$/g.test(components[0]) ||
      !/^[0-9a-f]+$/g.test(components[2])
    ) {
      return null;
    }
    const gtfsTripID = Buffer.from(components[0], "hex").toString();
    const subfeedID = Buffer.from(components[2], "hex").toString();

    const continuationIndex = parseIntNull(components[1]);
    const date = QDate.parse(components[3]);
    if (continuationIndex == null || continuationIndex < 0) {
      return null;
    }
    if (date == null || !date.isValid()) {
      return null;
    }

    return new GtfsServiceIDComponents(
      gtfsTripID,
      continuationIndex,
      subfeedID === "" ? null : subfeedID,
      date,
    );
  }

  encode(): string {
    return reencode(this.asString(), encodedAlpha, base48Safe);
  }
  static decode(input: string): GtfsServiceIDComponents | null {
    const decodedString = tryReencode(input, base48Safe, encodedAlpha);
    if (decodedString == null) {
      return null;
    }
    return GtfsServiceIDComponents.parse(decodedString);
  }
}
