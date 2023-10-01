import { z } from "zod";
import { DepartureFilter } from "./departure-filter";
import { type StopID, StopIDJson } from "../ids";
import { DepartureFeed } from "./departure-feed";

type PartialDepartureFeed = {
  filter: DepartureFilter;
  count: number;
};
type FeedException = {
  stops: StopID[];
  feeds: PartialDepartureFeed[];
};

export class DefaultDepartureFeeds {
  constructor(
    readonly defaultFeeds: PartialDepartureFeed[],
    readonly exceptions: FeedException[]
  ) {}

  getFeeds(
    stop: StopID,
    {
      arrivals = undefined,
      setDownOnly = undefined,
    }: { arrivals?: boolean; setDownOnly?: boolean } = {}
  ) {
    const exception = this.exceptions.find((e) =>
      e.stops.some((s) => s == stop)
    );
    if (exception != null) {
      return exception.feeds.map(
        (f) =>
          new DepartureFeed(
            stop,
            f.count,
            f.filter.with({ arrivals, setDownOnly })
          )
      );
    }
    return this.defaultFeeds.map(
      (f) =>
        new DepartureFeed(
          stop,
          f.count,
          f.filter.with({ arrivals, setDownOnly })
        )
    );
  }

  static readonly json = z
    .object({
      default: z
        .object({
          filter: DepartureFilter.json,
          count: z.number().default(5),
        })
        .array(),
      exceptions: z
        .object({
          stops: StopIDJson.array(),
          feeds: z
            .object({
              filter: DepartureFilter.json,
              count: z.number().default(5),
            })
            .array(),
        })
        .array(),
    })
    .transform((x) => new DefaultDepartureFeeds(x.default, x.exceptions));

  toJSON(): z.input<typeof DefaultDepartureFeeds.json> {
    return {
      default: this.defaultFeeds.map((f) => ({
        filter: f.filter.toJSON(),
        count: f.count,
      })),
      exceptions: this.exceptions.map((e) => ({
        stops: e.stops,
        feeds: e.feeds.map((f) => ({
          filter: f.filter.toJSON(),
          count: f.count,
        })),
      })),
    };
  }
}
