import { ZodAny, ZodType, z } from "zod";
import { ServiceTypeID, ServiceTypeIDJson } from "./ids";
import { Line } from "./line";
import { Stop } from "./stop";

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

type JsonLoader = <T extends ZodType>(path: string, schema: T) => Promise<z.infer<T>>;

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

  static async fromFile(json: unknown, loader: JsonLoader): Promise<SharedConfig> {
    const schema = z.object({
      stops: z.string(),
      lines: z.string()
    }).passthrough();
    const stopsYml = z.object({
      stops: z.any()
    });
    const linesYml = z.object({
      lines: z.any()
    });

    const value = (await (await new PopulateBuilder(schema.parse(json))
      .populate("stops", async (x) => (await loader(x, stopsYml)).stops))
      .populate("lines", async (x) => (await loader(x, linesYml)).lines))
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
    readonly metaDescription: string
  ) // Todo: departure feeds
  // Todo: search tags
  {
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
}

/** The config properties used by the server and never sent to the frontend. */
export class ServerOnlyConfig {
  constructor(/* todo: continuation */) { }

  static readonly json = z.object({}).transform((_x) => new ServerOnlyConfig());

  toJSON(): z.input<typeof ServerOnlyConfig.json> {
    return {};
  }
}

export async function populateOn<
  O extends { [P in keyof O]: P extends K ? string : unknown } & object,
  K extends keyof O,
  T
>(obj: O, key: K, retriever: (path: string) => Promise<T>): Promise<{
  [P in keyof O]: P extends K ? T : O[P];
}> {
  const value = obj[key] as string;
  const result = { ...obj };
  (result as any)[key] = await retriever(value) as T;
  return result;
}

export class PopulateBuilder<O extends object> {
  constructor(readonly value: O) {
    this.value = value;
  }
  async populate<K extends keyof O, T>(key: K, retriever: (path: string) => Promise<T>) {
    return new PopulateBuilder(await populateOn(this.value, key, retriever));
  }
  build(): O {
    return this.value;
  }
}
