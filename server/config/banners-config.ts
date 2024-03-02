import { z } from "zod";

export class StatusBannerConfig {
  constructor(
    readonly dismissable: "false" | "each-day",
    readonly message: string,
  ) {}

  static readonly json = z
    .object({
      dismissable: z.union([z.literal(false), z.enum(["false", "each-day"])]),
      message: z.string(),
    })
    .transform(
      (x) =>
        new StatusBannerConfig(
          StatusBannerConfig.dismissableFromUnion(x.dismissable),
          x.message,
        ),
    );

  static dismissableFromUnion(dismissable: false | "false" | "each-day") {
    if (dismissable === false) {
      return "false";
    } else {
      return dismissable;
    }
  }
}

export class CustomBannerConfig {
  constructor(
    readonly id: string,
    readonly dismissable: "true" | "false" | "each-day",
    readonly message: string,
  ) {}

  static readonly json = z
    .object({
      id: z.string(),
      dismissable: z.union([
        z.boolean(),
        z.enum(["true", "false", "each-day"]),
      ]),
      message: z.string(),
    })
    .transform(
      (x) =>
        new CustomBannerConfig(
          x.id,
          CustomBannerConfig.dismissableFromUnion(x.dismissable),
          x.message,
        ),
    );

  static dismissableFromUnion(
    dismissable: boolean | "true" | "false" | "each-day",
  ) {
    if (dismissable === true) {
      return "true";
    } else if (dismissable === false) {
      return "false";
    } else {
      return dismissable;
    }
  }
}

export class BannersConfig {
  static default = new BannersConfig(null, []);

  constructor(
    readonly staleDisruptions: StatusBannerConfig | null,
    readonly custom: CustomBannerConfig[],
  ) {}

  static readonly json = z
    .object({
      staleDisruptions: StatusBannerConfig.json.optional(),
      custom: CustomBannerConfig.json.array().default([]),
    })
    .transform((x) => new BannersConfig(x.staleDisruptions ?? null, x.custom));
}
