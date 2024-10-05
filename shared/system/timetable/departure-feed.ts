import { type StopID, StopIDJson, isStopID } from "../ids";
import {
  alpha,
  base48Safe,
  decimal,
  parseIntNull,
  reencode,
  tryReencode,
} from "@dan-schel/js-utils";
import { DepartureFilter } from "./departure-filter";
import { z } from "zod";

const encodedAlpha = alpha + decimal + "- |";

export class DepartureFeed {
  constructor(
    readonly stop: StopID,
    readonly count: number,
    readonly filter: DepartureFilter,
  ) {}

  static readonly json = z
    .object({
      stop: StopIDJson,
      count: z.number(),
      filter: DepartureFilter.json,
    })
    .transform((x) => new DepartureFeed(x.stop, x.count, x.filter));

  toJSON(): z.input<typeof DepartureFeed.json> {
    return {
      stop: this.stop,
      count: this.count,
      filter: this.filter.toJSON(),
    };
  }

  // TODO: Maybe I can remove everything beneath here when the API refactor is
  // finished?

  asString(): string {
    return `${this.stop.toFixed()}|${this.count.toFixed()}|${this.filter.asString()}`;
  }

  static parse(input: string): DepartureFeed | null {
    const components = input.split("|");
    if (components.length !== 3) {
      return null;
    }

    const stopNum = parseIntNull(components[0]);
    const count = parseIntNull(components[1]);
    const filter = DepartureFilter.parse(components[2]);
    if (stopNum == null || !isStopID(stopNum)) {
      return null;
    }
    if (count == null || count < 1) {
      return null;
    }
    if (filter == null) {
      return null;
    }
    return new DepartureFeed(stopNum, count, filter);
  }

  static encode(feeds: DepartureFeed[]) {
    return reencode(
      feeds.map((x) => x.asString()).join("|"),
      encodedAlpha,
      base48Safe,
    );
  }

  static decode(input: string): DepartureFeed[] | null {
    const decodedString = tryReencode(input, base48Safe, encodedAlpha);
    if (decodedString == null) {
      return null;
    }
    const components = decodedString.split("|");
    if (components.length < 3 || components.length % 3 !== 0) {
      return null;
    }

    const result: DepartureFeed[] = [];
    for (let i = 0; i < components.length; i += 3) {
      const parsed = DepartureFeed.parse(
        `${components[i]}|${components[i + 1]}|${components[i + 2]}`,
      );
      if (parsed == null) {
        return null;
      }
      result.push(parsed);
    }
    return result;
  }
}
