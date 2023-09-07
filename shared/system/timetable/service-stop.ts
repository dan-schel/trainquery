import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { ConfidenceLevel, ConfidenceLevelJson } from "../enums";
import { PlatformID, PlatformIDJson } from "../ids";

export class ServiceStop {
  constructor(
    readonly scheduledTime: QUtcDateTime,
    readonly liveTime: QUtcDateTime | null,
    readonly setsDown: boolean,
    readonly picksUp: boolean,
    readonly platform: {
      id: PlatformID,
      confidence: ConfidenceLevel
    } | null
  ) { }

  static readonly json = z.object({
    scheduledTime: QUtcDateTime.json,
    liveTime: QUtcDateTime.json.nullable(),
    setsDown: z.boolean(),
    picksUp: z.boolean(),
    platform: z.object({
      id: PlatformIDJson,
      confidence: ConfidenceLevelJson
    }).nullable()
  }).transform(x => new ServiceStop(x.scheduledTime, x.liveTime, x.setsDown, x.picksUp, x.platform));

  toJSON(): z.input<typeof ServiceStop.json> {
    return {
      scheduledTime: this.scheduledTime.toJSON(),
      liveTime: this.liveTime?.toJSON() ?? null,
      setsDown: this.setsDown,
      picksUp: this.picksUp,
      platform: this.platform == null ? null : {
        id: this.platform.id,
        confidence: this.platform.confidence
      }
    };
  }
}
