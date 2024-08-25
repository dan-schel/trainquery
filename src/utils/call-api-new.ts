import type { ApiDefinition } from "shared/api/api-definition";
import { z } from "zod";
import { fetchApi, type FetchResult } from "./call-api-fetcher";
import type { Session } from "shared/admin/session";

const resilienceTimeouts = [500, 2000];

/**
 * Sends a request to the backend, and parses the result. Retries multiple times
 * unless `resilient` is explicitly set to false.
 */
export async function callApi<
  ParamsSchema extends z.ZodTypeAny,
  ResultSchema extends z.ZodTypeAny,
>(
  api: ApiDefinition<ParamsSchema, ResultSchema>,
  params: z.infer<ParamsSchema>,
  {
    resilient = true,
    authSession = null,
  }: { resilient?: boolean; authSession?: Session | null } = {},
): Promise<FetchResult<z.infer<ResultSchema>>> {
  return await fetchApiResilient(
    api,
    params,
    authSession,
    resilient ? resilienceTimeouts : [],
  );
}

async function fetchApiResilient<
  ParamsSchema extends z.ZodTypeAny,
  ResultSchema extends z.ZodTypeAny,
>(
  api: ApiDefinition<ParamsSchema, ResultSchema>,
  params: z.infer<ParamsSchema>,
  authSession: Session | null,
  timeouts: number[],
): Promise<FetchResult<z.infer<ResultSchema>>> {
  const result = await fetchApi(api, params, authSession);

  if (
    result.type !== "error" ||
    !result.worthRetrying ||
    timeouts.length === 0
  ) {
    return result;
  }

  const [timeout, ...nextTimeouts] = timeouts;
  await new Promise((resolve) => setTimeout(resolve, timeout));
  return await fetchApiResilient(api, params, authSession, nextTimeouts);
}
