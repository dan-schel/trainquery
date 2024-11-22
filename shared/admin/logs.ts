import { z } from "zod";
import { QUtcDateTime } from "../qtime/qdatetime";

export const AdminLogLevels = ["info", "warn"] as const;
export type AdminLogLevel = (typeof AdminLogLevels)[number];
export const AdminLogLevelsJson = z.enum(AdminLogLevels);

// TODO: In future this enum will probably be more generally used outside of
// the admin logger, so it might move out of this file.
export const AdminLogServices = [
  "config",
  "disruptions",
  "gtfs",
  "gtfs-r",
  "auth",
  "page",
  "api",
  "ptv-platforms",
] as const;
export type AdminLogService = (typeof AdminLogServices)[number];
export const AdminLogServicesJson = z.enum(AdminLogServices);

export class AdminLog {
  constructor(
    readonly instance: string,

    /**
     * An integer that indicates the sort order of this log. Cannot be compared
     * across TrainQuery instances. Necessary because timestamps are rounded to
     * the second, and even millisecond precision wouldn't be enough.
     */
    readonly sequence: number,

    readonly level: AdminLogLevel,
    readonly service: AdminLogService | null,
    readonly message: string,
    readonly timestamp: QUtcDateTime,
  ) {}

  static readonly json = z
    .object({
      instance: z.string(),
      sequence: z.number(),
      level: AdminLogLevelsJson,
      service: AdminLogServicesJson.nullable(),
      message: z.string(),
      timestamp: QUtcDateTime.json,
    })
    .transform(
      (x) =>
        new AdminLog(
          x.instance,
          x.sequence,
          x.level,
          x.service,
          x.message,
          x.timestamp,
        ),
    );

  static readonly mongo = z
    .object({
      instance: z.string(),
      sequence: z.number(),
      level: AdminLogLevelsJson,
      service: AdminLogServicesJson.nullable(),
      message: z.string(),
      timestamp: QUtcDateTime.mongo,
    })
    .transform(
      (x) =>
        new AdminLog(
          x.instance,
          x.sequence,
          x.level,
          x.service,
          x.message,
          x.timestamp,
        ),
    );

  toJSON(): z.input<typeof AdminLog.json> {
    return {
      instance: this.instance,
      sequence: this.sequence,
      level: this.level,
      service: this.service,
      message: this.message,
      timestamp: this.timestamp.toJSON(),
    };
  }

  toMongo(): z.input<typeof AdminLog.mongo> {
    return {
      instance: this.instance,
      sequence: this.sequence,
      level: this.level,
      service: this.service,
      message: this.message,
      timestamp: this.timestamp.toMongo(),
    };
  }
}

export class AdminLogWindow {
  constructor(
    readonly instance: string,
    readonly logs: AdminLog[],
    readonly query: {
      readonly beforeSequence: number;
      readonly count: number;
    },
  ) {}

  static readonly json = z
    .object({
      instance: z.string(),
      logs: z.array(AdminLog.json),
      query: z.object({
        beforeSequence: z.number(),
        count: z.number(),
      }),
    })
    .transform((x) => new AdminLogWindow(x.instance, x.logs, x.query));

  toJSON(): z.input<typeof AdminLogWindow.json> {
    return {
      instance: this.instance,
      logs: this.logs.map((l) => l.toJSON()),
      query: this.query,
    };
  }
}
