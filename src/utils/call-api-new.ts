import type { ApiDefinition } from "shared/api/api-definition";
import { fetchApi, type FetchResult } from "./call-api-fetcher";
import type { Session } from "shared/admin/session";

const resilienceTimeouts = [500, 2000];

/**
 * Sends a request to the backend, and parses the result. Retries multiple times
 * unless `resilient` is explicitly set to false.
 */
export async function callApi<P, R, PS, RS>(
  api: ApiDefinition<P, R, PS, RS>,
  params: P,
  {
    resilient = true,
    authSession = null,
  }: { resilient?: boolean; authSession?: Session | null } = {},
): Promise<FetchResult<R>> {
  return await fetchApiResilient(
    api,
    params,
    authSession,
    resilient ? resilienceTimeouts : [],
  );
}

async function fetchApiResilient<P, R, PS, RS>(
  api: ApiDefinition<P, R, PS, RS>,
  params: P,
  authSession: Session | null,
  timeouts: number[],
): Promise<FetchResult<R>> {
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
