import { z } from "zod";

export const RefreshPolicies = ["always", "when-stale", "production"] as const;
export type RefreshPolicy = (typeof RefreshPolicies)[number];
export const RefreshPolicyJson = z.enum(RefreshPolicies);

export class GtfsPersistenceConfig {
  constructor(
    readonly mongoUrl: string,
    readonly refresh: RefreshPolicy,
    readonly refreshSeconds: number
  ) { }

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
    readonly subfeeds: { name: string, path: string }[] | null
  ) { }

  static readonly json = z
    .object({
      staticUrl: z.string(),
      persist: GtfsPersistenceConfig.json.nullable(),
      subfeeds: z.object({
        name: z.string(),
        path: z.string(),
      }).array().optional(),
    })
    .transform(
      (x) => new GtfsConfig(x.staticUrl, x.persist, x.subfeeds ?? null)
    );
}
