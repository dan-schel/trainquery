import { z } from "zod";
import { ApiDefinition } from "../../shared/api/api-definition";
import { TrainQuery } from "../ctx/trainquery";

export type ApiHandler<
  ParamsSchema extends z.ZodTypeAny,
  ResultSchema extends z.ZodTypeAny,
> = (
  ctx: TrainQuery,
  params: z.infer<ParamsSchema>,
) => Promise<z.infer<ResultSchema>>;

export function handle<
  ParamsSchema extends z.ZodTypeAny,
  ResultSchema extends z.ZodTypeAny,
>(
  api: ApiDefinition<ParamsSchema, ResultSchema>,
  handler: ApiHandler<ParamsSchema, ResultSchema>,
) {
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
