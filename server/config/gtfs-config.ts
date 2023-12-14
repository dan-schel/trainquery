import { z } from "zod";
import {
  LineID,
  LineIDJson,
  LineIDStringJson,
  StopID,
  StopIDJson,
} from "../../shared/system/ids";
import { IntStringJson, mapJson } from "../../shared/utils";

export class GtfsParsingRules {
  constructor(
    readonly routeIDRegex: RegExp[],
    readonly ignoreStops: StopID[],
    readonly canDedupeWith: LineID[],
  ) {}

  static readonly default = new GtfsParsingRules([], [], []);

  static readonly json = z
    .object({
      routeIDRegex: z
        .string()
        .array()
        .transform((x) => x.map((r) => new RegExp(r)))
        .default([]),
      ignoreStops: StopIDJson.array().default([]),
      canDedupeWith: LineIDJson.array().default([]),
    })
    .transform(
      (x) =>
        new GtfsParsingRules(x.routeIDRegex, x.ignoreStops, x.canDedupeWith),
    );
}

export class GtfsFeedConfig {
  constructor(
    /** Maps the stop IDs used by GTFS to the ones used by TrainQuery. */
    readonly stops: Map<number, StopID>,
    readonly parsing: Map<LineID, GtfsParsingRules>,
  ) {}

  getParsingRulesForLine(line: LineID) {
    return this.parsing.get(line) ?? GtfsParsingRules.default;
  }

  static readonly rawJson = z.object({
    stops: mapJson(IntStringJson, StopIDJson),
    parsing: mapJson(LineIDStringJson, GtfsParsingRules.json),
  });

  static transform(x: z.infer<typeof GtfsFeedConfig.rawJson>) {
    return new GtfsFeedConfig(x.stops, x.parsing);
  }
}

export class GtfsSubfeedConfig extends GtfsFeedConfig {
  constructor(
    readonly name: string,
    readonly path: string,
    stops: Map<number, StopID>,
    parsing: Map<LineID, GtfsParsingRules>,
  ) {
    super(stops, parsing);
  }

  static readonly json = GtfsFeedConfig.rawJson
    .extend({
      name: z.string(),
      path: z.string(),
    })
    .transform(
      (x) => new GtfsSubfeedConfig(x.name, x.path, x.stops, x.parsing),
    );
}

export class GtfsConfig<UsesSubfeeds extends boolean> {
  constructor(
    readonly staticData: string,
    readonly refreshHourUtc: number,
    readonly persist: boolean,
    readonly usesSubfeeds: UsesSubfeeds,
    readonly subfeeds: UsesSubfeeds extends true ? GtfsSubfeedConfig[] : null,
    readonly feed: UsesSubfeeds extends false ? GtfsFeedConfig : null,
  ) {}

  static readonly json = z.union([
    z
      .object({
        staticData: z.string(),
        refreshHourUtc: z.number(),
        persist: z.boolean(),
        subfeeds: GtfsSubfeedConfig.json.array(),
      })
      .transform(
        (x) =>
          new GtfsConfig(
            x.staticData,
            x.refreshHourUtc,
            x.persist,
            true,
            x.subfeeds,
            null,
          ),
      ),
    GtfsFeedConfig.rawJson
      .extend({
        staticData: z.string(),
        refreshHourUtc: z.number(),
        persist: z.boolean(),
      })
      .transform(
        (x) =>
          new GtfsConfig(
            x.staticData,
            x.refreshHourUtc,
            x.persist,
            false,
            null,
            GtfsFeedConfig.transform(x),
          ),
      ),
  ]);

  getFeedConfig(feed: string | null): GtfsFeedConfig | null {
    if (feed == null) {
      return this.feed;
    } else {
      return this.subfeeds?.find((f) => f.name == feed) ?? null;
    }
  }
  requireFeedConfig(feed: string | null): GtfsFeedConfig {
    const config = this.requireFeedConfig(feed);
    if (config == null) {
      if (feed == null && this.usesSubfeeds) {
        throw new Error(`This GTFS config uses subfeeds (cannot get "null").`);
      } else if (feed != null && !this.usesSubfeeds) {
        throw new Error(
          `This GTFS config doesn't use subfeeds (cannot get "${feed}").`,
        );
      } else {
        throw new Error(`Cannot get subfeed "${feed}" on this GTFS config.`);
      }
    }
    return config;
  }

  isOnlineSource() {
    return (
      this.staticData.startsWith("http://") ||
      this.staticData.startsWith("https://")
    );
  }
}
