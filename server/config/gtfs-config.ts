import { z } from "zod";
import { StopID, StopIDStringJson } from "../../shared/system/ids";
import { nonNull } from "@schel-d/js-utils";

export const RefreshPolicies = ["always", "when-stale", "production"] as const;
export type RefreshPolicy = (typeof RefreshPolicies)[number];
export const RefreshPolicyJson = z.enum(RefreshPolicies);

export class GtfsPersistenceConfig {
  constructor(
    readonly mongoUrl: string,
    readonly refresh: RefreshPolicy,
    readonly refreshSeconds: number
  ) {}

  static readonly json = z
    .object({
      mongoUrl: z.string(),
      refresh: RefreshPolicyJson,
      refreshSeconds: z.number(),
    })
    .transform(
      (x) => new GtfsPersistenceConfig(x.mongoUrl, x.refresh, x.refreshSeconds)
    );
}

export class GtfsConfig {
  constructor(
    readonly staticUrl: string,
    readonly persist: GtfsPersistenceConfig | null,
    readonly subfeeds: { name: string; path: string }[] | null,
    readonly stops: { feed: string | null; map: Map<number, StopID> }[]
  ) {}

  static readonly json = z
    .object({
      staticUrl: z.string(),
      persist: GtfsPersistenceConfig.json.nullable(),
      subfeeds: z
        .object({
          name: z.string(),
          path: z.string(),
        })
        .array()
        .optional(),
      stops: z.record(
        StopIDStringJson,
        z.union([z.number(), z.record(z.string(), z.number())])
      ),
    })
    .transform(
      (x) =>
        new GtfsConfig(
          x.staticUrl,
          x.persist,
          x.subfeeds ?? null,
          transformStopMap(x.stops, x.subfeeds?.map((x) => x.name) ?? null)
        )
    );
}

function transformStopMap(
  input: Partial<Record<StopID, number | Record<string, number>>>,
  feeds: string[] | null
): { feed: string | null; map: Map<number, StopID> }[] {
  if (feeds == null) {
    const pairs = Object.entries(input).map(([stopIDString, gtfsStopID]) => {
      const stopID = StopIDStringJson.parse(stopIDString);
      if (gtfsStopID == null || typeof gtfsStopID != "number") {
        throw new Error(
          `Stop mapping referenced subfeeds when subfeeds are not in use.`
        );
      }
      return [gtfsStopID, stopID] as [number, StopID];
    });
    return [
      {
        feed: null,
        map: new Map(pairs),
      },
    ];
  } else {
    return feeds.map((f) => {
      const pairs = Object.entries(input)
        .map(([stopIDString, gtfsStopIDOrMap]) => {
          const stopID = StopIDStringJson.parse(stopIDString);
          if (typeof gtfsStopIDOrMap == "number") {
            return [gtfsStopIDOrMap, stopID] as [number, StopID];
          } else {
            const gtfsStopID = gtfsStopIDOrMap![f];
            if (gtfsStopID == null) {
              return null;
            }
            return [gtfsStopID, stopID] as [number, StopID];
          }
        })
        .filter(nonNull);
      return {
        feed: f,
        map: new Map(pairs),
      };
    });
  }
}
