import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { type ConfidenceLevel, ConfidenceLevelJson } from "../enums";
import {
  type StopID,
  type PlatformID,
  StopIDJson,
  PlatformIDJson,
} from "../ids";

export class ServedStop {
  readonly express = false;

  constructor(
    readonly stop: StopID,
    readonly stopListIndex: number,
    readonly scheduledTime: QUtcDateTime,
    readonly liveTime: QUtcDateTime | null,
    readonly setsDown: boolean,
    readonly picksUp: boolean,
    readonly platform: {
      id: PlatformID;
      confidence: ConfidenceLevel;
    } | null,
  ) {}

  static readonly json = z
    .object({
      stop: StopIDJson,
      stopListIndex: z.number(),

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
    })
    .transform(
      (x) =>
        new ServedStop(
          x.stop,
          x.stopListIndex,
          x.scheduledTime,
          x.liveTime,
          x.setsDown,
          x.picksUp,
          x.platform,
        ),
    );

  toJSON(): z.input<typeof ServedStop.json> {
    return {
      stop: this.stop,
      stopListIndex: this.stopListIndex,
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

  with({
    platform,
  }: {
    platform?: {
      id: PlatformID;
      confidence: ConfidenceLevel;
    } | null;
  }): any {
    return new ServedStop(
      this.stop,
      this.stopListIndex,
      this.scheduledTime,
      this.liveTime,
      this.setsDown,
      this.picksUp,
      platform === undefined ? this.platform : platform,
    );
  }
}
