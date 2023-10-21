import { z } from "zod";
import { StopID, StopIDJson } from "../../shared/system/ids";
import { IntStringJson, mapJson } from "../../shared/utils";

export class GtfsFeedConfig {
  constructor(
    /** Maps the stop IDs used by GTFS to the ones used by TrainQuery. */
    readonly stops: Map<number, StopID>,
  ) {}

  static readonly rawJson = z.object({
    stops: mapJson(IntStringJson, StopIDJson),
  });
  static transform(x: z.infer<typeof GtfsFeedConfig.rawJson>) {
    return new GtfsFeedConfig(x.stops);
  }
}

export class GtfsSubfeedConfig extends GtfsFeedConfig {
  constructor(
    readonly name: string,
    readonly path: string,
    stops: Map<number, StopID>,
  ) {
    super(stops);
  }

  static readonly json = GtfsFeedConfig.rawJson
    .extend({
      name: z.string(),
      path: z.string(),
    })
    .transform((x) => new GtfsSubfeedConfig(x.name, x.path, x.stops));
}

export class GtfsConfig<UsesSubfeeds extends boolean> {
  constructor(
    readonly staticUrl: string,
    readonly refreshSeconds: number,
    readonly persist: boolean,
    readonly usesSubfeeds: UsesSubfeeds,
    readonly subfeeds: UsesSubfeeds extends true ? GtfsSubfeedConfig[] : null,
    readonly feed: UsesSubfeeds extends false ? GtfsFeedConfig : null,
  ) {}

  static readonly json = z.union([
    z
      .object({
        staticUrl: z.string(),
        refreshSeconds: z.number(),
        persist: z.boolean(),
        subfeeds: GtfsSubfeedConfig.json.array(),
      })
      .transform(
        (x) =>
          new GtfsConfig(
            x.staticUrl,
            x.refreshSeconds,
            x.persist,
            true,
            x.subfeeds,
            null,
          ),
      ),
    GtfsFeedConfig.rawJson
      .extend({
        staticUrl: z.string(),
        refreshSeconds: z.number(),
        persist: z.boolean(),
      })
      .transform(
        (x) =>
          new GtfsConfig(
            x.staticUrl,
            x.refreshSeconds,
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
}
