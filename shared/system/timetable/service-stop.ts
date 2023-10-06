import { z } from "zod";
import { QUtcDateTime } from "../../qtime/qdatetime";
import { type ConfidenceLevel, ConfidenceLevelJson } from "../enums";
import {
  type PlatformID,
  PlatformIDJson,
  type StopID,
  StopIDJson,
} from "../ids";

export abstract class StoppingPatternEntry<T extends boolean> {
  constructor(readonly stop: StopID, readonly express: T) {}
}

export class ServedStop extends StoppingPatternEntry<false> {
  constructor(
    stop: StopID,
    readonly scheduledTime: QUtcDateTime,
    readonly liveTime: QUtcDateTime | null,
    readonly setsDown: boolean,
    readonly picksUp: boolean,
    readonly platform: {
      id: PlatformID;
      confidence: ConfidenceLevel;
    } | null
  ) {
    super(stop, false);
  }

  static readonly json = z.object({
    stop: StopIDJson,
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
  });

  static transform(x: z.infer<typeof ServedStop.json>) {
    return new ServedStop(
      x.stop,
      x.scheduledTime,
      x.liveTime,
      x.setsDown,
      x.picksUp,
      x.platform
    );
  }

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

export class SkippedStop extends StoppingPatternEntry<true> {
  constructor(stop: StopID) {
    super(stop, true);
  }

  static readonly json = z.object({
    stop: StopIDJson,
    express: z.literal(true),
  });

  static transform(x: z.infer<typeof SkippedStop.json>) {
    return new SkippedStop(x.stop);
  }

  toJSON(): z.input<typeof SkippedStop.json> {
    return {
      stop: this.stop,
      express: this.express,
    };
  }
}

export const StoppingPatternEntryJson = z
  .discriminatedUnion("express", [ServedStop.json, SkippedStop.json])
  .transform((x) =>
    !x.express ? ServedStop.transform(x) : SkippedStop.transform(x)
  );

export function stoppingPatternEntryToJSON<T extends boolean>(
  entry: StoppingPatternEntry<T>
): z.input<typeof StoppingPatternEntryJson> {
  if (entry instanceof ServedStop) {
    return entry.toJSON();
  } else if (entry instanceof SkippedStop) {
    return entry.toJSON();
  } else {
    throw new Error("Unrecognized type of stopping pattern entry.");
  }
}
