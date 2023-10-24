import { z } from "zod";
import { Line } from "../line";
import { ServiceType } from "../service-type";
import { Stop } from "../stop";
import { UrlNames } from "../url-names";
import {
  HookContinuationGroup,
  LinearContinuationGroup,
} from "../continuation-group";

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
    /** Maps stops to more memorable URLs. */
    readonly urlNames: UrlNames,
    /** How services form new services upon reaching their termini. */
    readonly continuationRules: (
      | LinearContinuationGroup
      | HookContinuationGroup
    )[],
    /** True if stops should list their platforms. Enables platform filtering. */
    readonly usePlatforms: boolean,
    /** The timezone the transit system's timetables use. */
    readonly timezone: TimezoneConfig,
    /**
     * Array of all possible service types, e.g. [suburban, regional]. Enables
     * service type filtering.
     */
    readonly serviceTypes: ServiceType[],
    /** E.g. 'https://trainquery.com'. */
    readonly canonicalUrl: string,
  ) {}

  static readonly json = z
    .object({
      stops: Stop.json.array(),
      lines: Line.json.array(),
      urlNames: UrlNames.json,
      continuationRules: z
        .union([LinearContinuationGroup.json, HookContinuationGroup.json])
        .array()
        .default([]),
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
      serviceTypes: ServiceType.json.array(),
      canonicalUrl: z.string(),
    })
    .transform(
      (x) =>
        new SharedConfig(
          x.stops,
          x.lines,
          x.urlNames,
          x.continuationRules,
          x.usePlatforms,
          x.timezone,
          x.serviceTypes,
          x.canonicalUrl,
        ),
    );

  toJSON(): z.input<typeof SharedConfig.json> {
    return {
      stops: this.stops.map((s) => s.toJSON()),
      lines: this.lines.map((l) => l.toJSON()),
      urlNames: this.urlNames.toJSON(),
      continuationRules:
        this.continuationRules.length == 0
          ? undefined
          : this.continuationRules.map((c) => c.toJSON()),
      usePlatforms: this.usePlatforms,
      timezone: this.timezone,
      serviceTypes: this.serviceTypes.map((s) => s.toJSON()),
      canonicalUrl: this.canonicalUrl,
    };
  }
}
