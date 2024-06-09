import { QUtcDateTime } from "../../shared/qtime/qdatetime";

export function requirePositiveInteger(num: number, name: string) {
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

export type TimestampedData<T> = {
  readonly value: T;
  readonly timestamp: QUtcDateTime;
};
