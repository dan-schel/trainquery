import { parseIntNull } from "@dan-schel/js-utils";
import { getStop } from "../shared/system/config-utils";
import { StopID, isStopID } from "../shared/system/ids";
import { Stop } from "../shared/system/stop";
import { ServerParams, TrainQuery } from "./ctx/trainquery";
import { QUtcDateTime } from "../shared/qtime/qdatetime";

export class BadApiCallError extends Error {
  readonly type = "bad-api-call";
  constructor(
    message: string,
    readonly statusCode = 400,
  ) {
    super(message);
  }
  static detect(error: unknown): error is BadApiCallError {
    return (
      error != null &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "bad-api-call"
    );
  }
}

export function requireParam(params: ServerParams, name: string): string {
  const value = params.query[name];
  if (value == null) {
    throw new BadApiCallError(`"${name}" param is required.`);
  }
  return value;
}

export function requireParamThat<T>(
  params: ServerParams,
  name: string,
  validator: (input: string) => T | null,
): T {
  const value = requireParam(params, name);
  const result = validator(value);
  if (result == null) {
    throw new BadApiCallError(`"${name}" param is invalid.`);
  }
  return result;
}

export function requireStopIDParam(params: ServerParams, name: string): StopID {
  const value = requireParam(params, name);
  const num = parseIntNull(value);
  if (num == null || !isStopID(num)) {
    throw new BadApiCallError(`"${name}" param should be a stop ID.`);
  }
  return num;
}

export function requireStopParam(
  ctx: TrainQuery,
  params: ServerParams,
  name: string,
): Stop {
  const id = requireStopIDParam(params, name);
  const stop = getStop(ctx.getConfig(), id);
  if (stop == null) {
    throw new BadApiCallError(`Stop ${id} does not exist.`);
  }
  return stop;
}

export function requireDateTimeParam(
  params: ServerParams,
  name: string,
): QUtcDateTime {
  const value = requireParam(params, name);
  const date = QUtcDateTime.parse(value);
  if (date == null || !date.isValid().valid) {
    throw new BadApiCallError(
      `"${name}" param should be a valid ISO8601 UTC date/time.`,
    );
  }
  return date;
}

export function requireBodyParam(params: ServerParams, name: string): string {
  const value = params.body[name] as string;
  if (value == null) {
    throw new BadApiCallError(`"${name}" param is required.`);
  }
  return value;
}
