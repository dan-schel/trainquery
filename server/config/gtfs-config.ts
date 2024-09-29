import { z } from "zod";
import {
  LineID,
  LineIDJson,
  LineIDStringJson,
  StopID,
  StopIDJson,
} from "../../shared/system/ids";
import { IntStringJson, mapJson } from "../../shared/utils";

export class IgnoreStopsRules {
  constructor(
    readonly stop: StopID,
    readonly ifPresent: StopID[],
  ) {}

  applies(stoppingOrder: StopID[]) {
    // Array.every correctly returns true for an empty array.
    return this.ifPresent.every((s) => stoppingOrder.includes(s));
  }

  static readonly json = z
    .union([
      StopIDJson,
      z.object({
        stop: StopIDJson,
        ifPresent: StopIDJson.array().default([]),
      }),
    ])
    .transform((x) =>
      typeof x === "number"
        ? new IgnoreStopsRules(x, [])
        : new IgnoreStopsRules(x.stop, x.ifPresent),
    );
}

export class GtfsParsingRules {
  constructor(
    readonly routeIDRegex: RegExp[],
    readonly ignoreStops: IgnoreStopsRules[],
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
      ignoreStops: IgnoreStopsRules.json.array().default([]),
      canDedupeWith: LineIDJson.array().default([]),
    })
    .transform(
      (x) =>
        new GtfsParsingRules(x.routeIDRegex, x.ignoreStops, x.canDedupeWith),
    );
}

/** All supported authentication methods potentially required by GTFS-R API(s). */
export const GtfsRealtimeAuthMethods = ["none", "melbourne"] as const;
/** Which authentication method is required by the GTFS-R API(s). */
export type GtfsRealtimeAuthMethod = (typeof GtfsRealtimeAuthMethods)[number];
/** Matches a value in {@link GtfsRealtimeAuthMethods}. */
export const GtfsRealtimeAuthMethodJson = z.enum(GtfsRealtimeAuthMethods);

export class GtfsRealtimeConfig {
  constructor(
    readonly apis: string[],
    readonly apiAuth: GtfsRealtimeAuthMethod,
    readonly refreshInterval: number,
    readonly inactivityTimeout: number,
    readonly staleAfter: number,
  ) {}

  static readonly json = z
    .object({
      api: z.union([z.string(), z.string().array()]),
      apiAuth: GtfsRealtimeAuthMethodJson,
      refreshInterval: z.number(),
      inactivityTimeout: z.number(),
      staleAfter: z.number(),
    })
    .transform(
      (x) =>
        new GtfsRealtimeConfig(
          typeof x.api === "string" ? [x.api] : x.api,
          x.apiAuth,
          x.refreshInterval,
          x.inactivityTimeout,
          x.staleAfter,
        ),
    );
}

export class GtfsFeedConfig {
  constructor(
    /** Maps the stop IDs used by GTFS to the ones used by TrainQuery. */
    readonly stops: Map<number, StopID>,
    readonly parsing: Map<LineID, GtfsParsingRules>,
    readonly realtime: GtfsRealtimeConfig | null,
  ) {}

  getParsingRulesForLine(line: LineID) {
    return this.parsing.get(line) ?? GtfsParsingRules.default;
  }

  static readonly rawJson = z.object({
    stops: mapJson(IntStringJson, StopIDJson),
    parsing: mapJson(LineIDStringJson, GtfsParsingRules.json),
    realtime: GtfsRealtimeConfig.json.optional(),
  });

  static transform(x: z.infer<typeof GtfsFeedConfig.rawJson>) {
    return new GtfsFeedConfig(x.stops, x.parsing, x.realtime ?? null);
  }
}

export class GtfsSubfeedConfig extends GtfsFeedConfig {
  constructor(
    readonly name: string,
    readonly path: string,
    stops: Map<number, StopID>,
    parsing: Map<LineID, GtfsParsingRules>,
    realtime: GtfsRealtimeConfig | null,
  ) {
    super(stops, parsing, realtime);
  }

  static readonly json = GtfsFeedConfig.rawJson
    .extend({
      name: z.string(),
      path: z.string(),
    })
    .transform(
      (x) =>
        new GtfsSubfeedConfig(
          x.name,
          x.path,
          x.stops,
          x.parsing,
          x.realtime ?? null,
        ),
    );
}

const GtfsSourceJson = z.union([
  z.object({
    method: z.literal("local"),
    path: z.string(),
  }),
  z.object({
    method: z.literal("url"),
    url: z.string(),
  }),
  z.object({
    method: z.literal("relay"),
    url: z.string(),
  }),
]);

type GtfsSource = z.infer<typeof GtfsSourceJson>;

export class GtfsConfig<UsesSubfeeds extends boolean> {
  constructor(
    readonly staticData: GtfsSource,
    readonly refreshHourUtc: number,
    readonly persist: boolean,
    readonly usesSubfeeds: UsesSubfeeds,
    readonly subfeeds: UsesSubfeeds extends true ? GtfsSubfeedConfig[] : null,
    readonly feed: UsesSubfeeds extends false ? GtfsFeedConfig : null,
  ) {}

  static readonly json = z.union([
    z
      .object({
        staticData: GtfsSourceJson,
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
        staticData: GtfsSourceJson,
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
      return this.subfeeds?.find((f) => f.name === feed) ?? null;
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
    return this.staticData.method !== "local";
  }
}
