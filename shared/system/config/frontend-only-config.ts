import { z } from "zod";
import { DirectionNames } from "../direction-names";
import { DefaultDepartureFeeds } from "../timetable/default-departure-feeds";
import { ViaRule } from "../via-rule";

/** The config properties (primarily) used by the frontend. */
export class FrontendOnlyConfig {
  constructor(
    // TODO: search tags

    /** E.g. 'TrainQuery'. */
    readonly appName: string,
    /** True to show 'BETA' next to the app name. */
    readonly beta: boolean,
    /** Used on the homepage, e.g. 'Navigate Melbourne's train network'. */
    readonly tagline: string,
    /** Raw HTML string with copyright info and disclaimers visible in the footer. */
    readonly footer: string,
    /**
     * Used in the SEO description, e.g. 'Navigate Melbourne's train network
     * with TrainQuery'.
     */
    readonly metaDescription: string,
    /** Rules describing when to show 'via ___' on a departure. */
    readonly via: ViaRule[],
    /** Default departure feeds, e.g. Southern Cross does regional vs suburban. */
    readonly departureFeeds: DefaultDepartureFeeds,
    /** E.g. 'citybound' for up. */
    readonly directionNames: DirectionNames,
  ) {}

  static readonly json = z
    .object({
      appName: z.string(),
      beta: z.boolean().default(false),
      tagline: z.string(),
      footer: z.string(),
      metaDescription: z.string(),
      via: ViaRule.json.array().default([]),
      departureFeeds: DefaultDepartureFeeds.json,
      directionNames: DirectionNames.json,
    })
    .transform(
      (x) =>
        new FrontendOnlyConfig(
          x.appName,
          x.beta,
          x.tagline,
          x.footer,
          x.metaDescription,
          x.via,
          x.departureFeeds,
          x.directionNames,
        ),
    );

  toJSON(): z.input<typeof FrontendOnlyConfig.json> {
    return {
      appName: this.appName,
      beta: this.beta ? true : undefined,
      tagline: this.tagline,
      footer: this.footer,
      metaDescription: this.metaDescription,
      via: this.via.map((v) => v.toJSON()),
      departureFeeds: this.departureFeeds.toJSON(),
      directionNames: this.directionNames.toJSON(),
    };
  }
}
