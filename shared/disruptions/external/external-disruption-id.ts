import { reencode, base48Safe, tryReencode } from "@dan-schel/js-utils";
import { stringToHex, hexToString } from "../../utils";

export class ExternalDisruptionID {
  static readonly encodedAlpha = "0123456789abcdef|";

  constructor(
    readonly type: string,
    readonly externalID: string,
  ) {}

  equals(other: ExternalDisruptionID) {
    return this.type === other.type && this.externalID === other.externalID;
  }

  encodeForUrl(): string {
    const asString =
      stringToHex(this.type) + "|" + stringToHex(this.externalID);
    return reencode(asString, ExternalDisruptionID.encodedAlpha, base48Safe);
  }

  static decodeFromUrl(input: string): ExternalDisruptionID | null {
    const decodedString = tryReencode(
      input,
      base48Safe,
      ExternalDisruptionID.encodedAlpha,
    );
    if (decodedString == null) {
      return null;
    }

    const components = decodedString.split("|");
    if (components.length !== 2) {
      return null;
    }

    if (
      !/^[0-9a-f]+$/g.test(components[0]) ||
      !/^[0-9a-f]+$/g.test(components[1])
    ) {
      return null;
    }
    const type = hexToString(components[0]);
    const externalID = hexToString(components[1]);

    return new ExternalDisruptionID(type, externalID);
  }
}
