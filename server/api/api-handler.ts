import { Session } from "../../shared/admin/session";
import { ApiDefinition } from "../../shared/api/api-definition";
import { TrainQuery } from "../ctx/trainquery";

export type ApiHandler<P, R, PS, RS> = {
  api: ApiDefinition<P, R, PS, RS>;
  handler: ApiHandlerFunction<P, R>;
};

export type ApiHandlerFunction<P, R> = (
  ctx: TrainQuery,
  params: P,
  session: Session | null,
) => Promise<R>;

export function handle<P, R, PS, RS>(
  api: ApiDefinition<P, R, PS, RS>,
  handler: ApiHandlerFunction<P, R>,
): ApiHandler<P, R, PS, RS> {
  return { api, handler };
}

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
