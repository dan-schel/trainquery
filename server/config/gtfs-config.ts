import { z } from "zod";
import { StopID, StopIDStringJson } from "../../shared/system/ids";

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
    readonly stops: Map<[string | null, number], StopID>
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
          transformStopMap(x.stops)
        )
    );
}

function transformStopMap(
  input: Partial<Record<StopID, number | Record<string, number>>>
): Map<[string | null, number], StopID> {
  return new Map(
    Object.entries(input)
      .map(([stopIDString, gtfsIDOrMap]) => {
        const mappings: [[string | null, number], StopID][] = [];
        const stopID = StopIDStringJson.parse(stopIDString);
        if (typeof gtfsIDOrMap === "number") {
          mappings.push([[null, gtfsIDOrMap], stopID]);
        } else {
          mappings.push(
            ...Object.entries(gtfsIDOrMap!).map(
              ([subfeed, gtfsID]) =>
                [[subfeed, gtfsID], stopID] as [[string, number], StopID]
            )
          );
        }
        return mappings;
      })
      .flat()
  );
}
