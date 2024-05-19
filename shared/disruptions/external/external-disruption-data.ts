import { QUtcDateTime } from "../../qtime/qdatetime";
import { ExternalDisruptionID } from "./external-disruption-id";

export abstract class ExternalDisruptionData {
  abstract getID(): ExternalDisruptionID;
  abstract getSummary(): string;
  abstract getStarts(): QUtcDateTime | null;
  abstract getEnds(): QUtcDateTime | null;

  abstract matchesContent(other: ExternalDisruptionData): boolean;
}
