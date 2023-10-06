import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { type ConfidenceLevel, ConfidenceLevelJson } from "../enums";
import {
  type PlatformID,
  PlatformIDJson,
  type StopID,
  StopIDJson,
} from "../ids";

export class ServedStop {
  readonly express = false;

  constructor(
    readonly stop: StopID,
    readonly scheduledTime: QUtcDateTime,
    readonly liveTime: QUtcDateTime | null,
    readonly setsDown: boolean,
    readonly picksUp: boolean,
    readonly platform: {
      id: PlatformID;
      confidence: ConfidenceLevel;
    } | null
  ) { }

  static readonly json = z.object({
    stop: StopIDJson,

    // Ensures this is never confused for a skipped stop.
    express: z.literal(false),

    scheduledTime: QUtcDateTime.json,
    liveTime: QUtcDateTime.json.nullable(),
    setsDown: z.boolean(),
    picksUp: z.boolean(),
    platform: z
      .object({
        id: PlatformIDJson,
        confidence: ConfidenceLevelJson,
      })
      .nullable(),
  }).transform(x => new ServedStop(
    x.stop,
    x.scheduledTime,
    x.liveTime,
    x.setsDown,
    x.picksUp,
    x.platform
  ));

  toJSON(): z.input<typeof ServedStop.json> {
    return {
      stop: this.stop,
      express: this.express,
      scheduledTime: this.scheduledTime.toJSON(),
      liveTime: this.liveTime?.toJSON() ?? null,
      setsDown: this.setsDown,
      picksUp: this.picksUp,
      platform:
        this.platform == null
          ? null
          : {
            id: this.platform.id,
            confidence: this.platform.confidence,
          },
    };
  }
}

export class SkippedStop {
  readonly express = true;

  constructor(readonly stop: StopID) { }

  static readonly json = z.object({
    stop: StopIDJson,

    // Ensures this is never confused for a served stop.
    express: z.literal(true),
  }).transform(x => new SkippedStop(x.stop));

  toJSON(): z.input<typeof SkippedStop.json> {
    return {
      stop: this.stop,
      express: this.express,
    };
  }
}
