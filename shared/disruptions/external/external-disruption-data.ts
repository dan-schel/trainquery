import { QUtcDateTime } from "../../qtime/qdatetime";
import type { ExternalDisruptionID } from "../../system/ids";

export abstract class ExternalDisruptionData {
  /**
   * Uniquely identified this disruption from an external source. The convention
   * is to prefix the ID with the value of {@link getType}, e.g. "ptv-1234", to
   * help ensure it remains unique if multiple disruption sources are used.
   */
  abstract getID(): ExternalDisruptionID;

  abstract getType(): string;
  abstract getSummary(): string;
  abstract getStarts(): QUtcDateTime | null;
  abstract getEnds(): QUtcDateTime | null;

  abstract matchesContent(other: ExternalDisruptionData): boolean;
}
