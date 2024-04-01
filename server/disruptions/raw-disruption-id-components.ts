import { base48Safe, reencode, tryReencode } from "@dan-schel/js-utils";
import { z } from "zod";

export const DisruptionSourceIDs = ["ptv"] as const;
export type DisruptionSourceID = (typeof DisruptionSourceIDs)[number];
export const DisruptionSourceIDJson = z.enum(DisruptionSourceIDs);

const encodedAlpha = "0123456789abcdef|";

export class RawDisruptionIDComponents {
  constructor(
    readonly source: DisruptionSourceID,
    readonly id: string,
  ) {}

  asString() {
    return (
      Buffer.from(this.source).toString("hex") +
      "|" +
      Buffer.from(this.id).toString("hex")
    );
  }
  static parse(input: string): RawDisruptionIDComponents | null {
    const components = input.split("|");
    if (components.length !== 2) {
      return null;
    }

    if (
      !/^[0-9a-f]+$/g.test(components[0]) ||
      !/^[0-9a-f]+$/g.test(components[1])
    ) {
      return null;
    }
    const sourceString = Buffer.from(components[0], "hex").toString();
    const sourceParsed = DisruptionSourceIDJson.safeParse(sourceString);
    const id = Buffer.from(components[1], "hex").toString();

    if (!sourceParsed.success) {
      return null;
    }

    return new RawDisruptionIDComponents(sourceParsed.data, id);
  }

  encode(): string {
    return reencode(this.asString(), encodedAlpha, base48Safe);
  }
  static decode(input: string): RawDisruptionIDComponents | null {
    const decodedString = tryReencode(input, base48Safe, encodedAlpha);
    if (decodedString == null) {
      return null;
    }
    return RawDisruptionIDComponents.parse(decodedString);
  }
}
