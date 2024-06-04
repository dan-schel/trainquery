import { QUtcDateTime } from "../../qtime/qdatetime";
import {
  toExternalDisruptionID,
  type ExternalDisruptionID,
} from "../../system/ids";

export abstract class ExternalDisruptionData {
  /**
   * Uniquely identified this disruption from an external source. The convention
   * is to prefix the ID with the value of {@link getType}, e.g. "ptv-1234", to
   * help ensure it remains unique if multiple disruption sources are used.
   */
  abstract getID(): ExternalDisruptionID;

  abstract getType(): string;
  abstract getStarts(): QUtcDateTime | null;
  abstract getEnds(): QUtcDateTime | null;

  abstract matchesContent(other: ExternalDisruptionData): boolean;

  // TODO: This should be a protected method, but for some reason if I make it a
  // protected method, the places where it's used as a value in a Vue ref no
  // longer have this method. Try making it protected and run "npm run lint".
  // Discussed here: https://github.com/vuejs/core/issues/3815. Might be fixed
  // in a newer version of Vue, or there might be a workaround.
  _createID(id: string): ExternalDisruptionID {
    return toExternalDisruptionID(`${this.getType()}-${id}`);
  }
}
