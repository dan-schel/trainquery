import { z } from "zod";
import { type ServiceTypeID, ServiceTypeIDJson } from "./ids";
import { Line } from "./line";
import { Stop } from "./stop";
import { type JsonLoader, PopulateBuilder } from "./populate";

/** Describes how to calculate the timezone offset of the timetables. */
export type TimezoneConfig =
  | {
      /** E.g. '10' for AEST, or '11' for AEDT. */
      offset: number;
    }
  | {
      /** E.g. 'Australia/Melbourne'. */
      id: string;
      /**
       * Which hour of the day to use when checking the offset, since DST doesn't
       * start at midnight.
       */
      offsetCheckHour: number;
    };

/** The config properties required by both the frontend and backend. */
export class SharedConfig {
  constructor(
    /** The stops in the transit system. */
    readonly stops: Stop[],
    /** The lines in the transit system. */
    readonly lines: Line[],
    /** True if stops should list their platforms. Enables platform filtering. */
    readonly usePlatforms: boolean,
    /** The timezone the transit system's timetables use. */
    readonly timezone: TimezoneConfig,
    /**
     * Array of all possible service types, e.g. [suburban, regional]. Enables
     * service type filtering.
     */
    readonly serviceTypes: ServiceTypeID[]
  ) {
    this.stops = stops;
    this.lines = lines;
    this.usePlatforms = usePlatforms;
    this.timezone = timezone;
    this.serviceTypes = serviceTypes;
  }

  static readonly json = z
    .object({
      stops: Stop.json.array(),
      lines: Line.json.array(),
      usePlatforms: z.boolean(),
      timezone: z.union([
        z.object({
          offset: z.number(),
        }),
        z.object({
          id: z.string(),
          offsetCheckHour: z.number(),
        }),
      ]),
      serviceTypes: ServiceTypeIDJson.array().default(["normal"]),
    })
    .transform(
      (x) =>
        new SharedConfig(
          x.stops,
          x.lines,
          x.usePlatforms,
          x.timezone,
          x.serviceTypes
        )
    );

  toJSON(): z.input<typeof SharedConfig.json> {
    return {
      stops: this.stops.map((s) => s.toJSON()),
      lines: this.lines.map((l) => l.toJSON()),
      usePlatforms: this.usePlatforms,
      timezone: this.timezone,
      serviceTypes: this.serviceTypes,
    };
  }

  /** Parse from file (some props reference other files instead of providing data). */
  static async fromFile(
    json: unknown,
    loader: JsonLoader
  ): Promise<SharedConfig> {
    const replacementSchema = z
      .object({ stops: z.string(), lines: z.string() })
      .passthrough();
    const stopsYml = z.object({ stops: z.any() });
    const linesYml = z.object({ lines: z.any() });

    const value = await new PopulateBuilder(replacementSchema.parse(json))
      .populate("stops", async (x) => (await loader(x, stopsYml)).stops)
      .populate("lines", async (x) => (await loader(x, linesYml)).lines)
      .build();

    return SharedConfig.json.parse(value);
  }
}

/** The config properties (primarily) used by the frontend. */
export class FrontendOnlyConfig {
  constructor(
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
    readonly metaDescription: string // Todo: departure feeds // Todo: search tags
  ) {
    this.appName = appName;
    this.beta = beta;
    this.tagline = tagline;
    this.footer = footer;
    this.metaDescription = metaDescription;
  }

  static readonly json = z
    .object({
      appName: z.string(),
      beta: z.boolean().default(false),
      tagline: z.string(),
      footer: z.string(),
      metaDescription: z.string(),
    })
    .transform(
      (x) =>
        new FrontendOnlyConfig(
          x.appName,
          x.beta,
          x.tagline,
          x.footer,
          x.metaDescription
        )
    );

  toJSON(): z.input<typeof FrontendOnlyConfig.json> {
    return {
      appName: this.appName,
      beta: !this.beta ? undefined : true,
      tagline: this.tagline,
      footer: this.footer,
      metaDescription: this.metaDescription,
    };
  }

  /** Parse from file (some props reference other files instead of providing data). */
  static async fromFile(
    json: unknown,
    loader: JsonLoader
  ): Promise<FrontendOnlyConfig> {
    const replacementSchema = z
      .object({ departureFeeds: z.string() })
      .passthrough();
    const departureFeedsYml = z.any();

    const value = await new PopulateBuilder(replacementSchema.parse(json))
      .populate(
        "departureFeeds",
        async (x) => await loader(x, departureFeedsYml)
      )
      .build();

    return FrontendOnlyConfig.json.parse(value);
  }
}

/** The config properties used by the server and never sent to the frontend. */
export class ServerOnlyConfig {
  constructor(/* todo: continuation */) {}

  static readonly json = z.object({}).transform((_x) => new ServerOnlyConfig());

  toJSON(): z.input<typeof ServerOnlyConfig.json> {
    return {};
  }

  /** Parse from file (some props reference other files instead of providing data). */
  static async fromFile(
    json: unknown,
    loader: JsonLoader
  ): Promise<ServerOnlyConfig> {
    const replacementSchema = z
      .object({ continuation: z.string() })
      .passthrough();
    const continuationYml = z.any();

    const value = await new PopulateBuilder(replacementSchema.parse(json))
      .populate("continuation", async (x) => await loader(x, continuationYml))
      .build();

    return ServerOnlyConfig.json.parse(value);
  }
}
