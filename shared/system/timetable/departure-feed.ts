import { type StopID, isStopID } from "../ids";
import {
  alpha,
  base48Safe,
  decimal,
  parseIntNull,
  reencode,
  tryReencode,
} from "@schel-d/js-utils";

const encodedAlpha = alpha + decimal + "- |";

export class DepartureFeed {
  constructor(
    readonly stop: StopID,
    readonly count: number,
    readonly filter: string
  ) {}

  toString(): string {
    return `${this.stop.toFixed()}|${this.count.toFixed()}|${this.filter}`;
  }

  static parse(input: string): DepartureFeed | null {
    const components = input.split("|");
    if (components.length != 3) {
      return null;
    }

    const stopNum = parseIntNull(components[0]);
    const count = parseIntNull(components[1]);
    if (stopNum == null || !isStopID(stopNum)) {
      return null;
    }
    if (count == null || count < 1) {
      return null;
    }
    return new DepartureFeed(stopNum, count, components[2]);
  }

  static encode(feeds: DepartureFeed[]) {
    return reencode(
      feeds.map((x) => x.toString()).join("|"),
      encodedAlpha,
      base48Safe
    );
  }

  static decode(input: string): DepartureFeed[] | null {
    const decodedString = tryReencode(input, base48Safe, encodedAlpha);
    if (decodedString == null) {
      return null;
    }
    const components = decodedString.split("|");
    if (components.length < 3 || components.length % 3 != 0) {
      return null;
    }

    const result: DepartureFeed[] = [];
    for (let i = 0; i < components.length; i += 3) {
      const parsed = DepartureFeed.parse(
        `${components[i]}|${components[i + 1]}|${components[i + 2]}`
      );
      if (parsed == null) {
        return null;
      }
      result.push(parsed);
    }
    return result;
  }
}
