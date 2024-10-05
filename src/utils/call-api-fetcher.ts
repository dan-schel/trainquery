import type { ApiDefinition } from "shared/api/api-definition";
import { z } from "zod";
import { getConfig } from "./get-config";
import type { Session } from "shared/admin/session";

export type SuccessfulFetchResult<T> = {
  type: "success";
  data: T;
};

export type FailedFetchResult = {
  type: "error";
  worthRetrying: boolean;
  error: unknown;
  httpCode: number | null;
};

export type ConfigOutdatedFetchResult = {
  type: "config-outdated";
};

export type FetchResult<T> =
  | SuccessfulFetchResult<T>
  | FailedFetchResult
  | ConfigOutdatedFetchResult;

export async function fetchApi<P, R, PS, RS>(
  api: ApiDefinition<P, R, PS, RS>,
  params: P,
  authSession: Session | null,
  baseUrl: string,
): Promise<FetchResult<R>> {
  try {
    console.log("");
    console.log("");
    console.log("CALLING FETCH -------");
    console.log(`url: ${baseUrl}/api/${api.endpoint}`);
    console.log(`method: POST`);
    console.log(
      `body: ${JSON.stringify({ params: api.paramsSerializer(params) })}`,
    );
    console.log(
      `headers: ${JSON.stringify({
        "Content-Type": "application/json",
        ...(authSession != null ? { "admin-token": authSession.token } : {}),
      })}`,
    );
    console.log("---------------------");
    console.log("");
    console.log("");

    const response = await fetch(`${baseUrl}/api/${api.endpoint}`, {
      method: "POST",
      body: JSON.stringify({ params: api.paramsSerializer(params) }),
      headers: {
        "Content-Type": "application/json",
        ...(authSession != null ? { "admin-token": authSession.token } : {}),
      },
    });

    if (!response.ok) {
      // Probably only worth retrying in the event of a server error (5XX).
      // Certainly do not retry if it's a client error (4XX).
      const worthRetrying = response.status >= 500 && response.status < 600;
      return {
        type: "error",
        worthRetrying,
        error: response.body,
        httpCode: response.status,
      };
    }

    const json = await response.json();

    const parsed = parseResultAndHash(api, json);

    if ("error" in parsed) {
      // The result JSON is in an unexpected format. No point retrying.
      return {
        type: "error",
        worthRetrying: false,
        error: parsed.error,
        httpCode: null,
      };
    }

    const { result, hash } = parsed;

    if (hash != null && getConfig().hash !== hash) {
      // The cached config the client has is outdated, so refresh the page to
      // load the new config.
      window.location.reload();
      return {
        type: "config-outdated",
      };
    }

    return {
      type: "success",
      data: result,
    };
  } catch (error) {
    // Probably the connection failed/timed out? Worth retrying.
    return {
      type: "error",
      worthRetrying: true,
      error,
      httpCode: null,
    };
  }
}

function parseResultAndHash<P, R, PS, RS>(
  api: ApiDefinition<P, R, PS, RS>,
  json: unknown,
): { result: R; hash: string | undefined } | { error: unknown } {
  // For some reason, adding api.resultSchema directly into this schema breaks
  // the inferred types, and I'd have to do a type assertion ("as"). So instead,
  // We first check it's an object with a hash and result (of some kind), and
  // then check the result against the schema afterwards.
  const fullSchema = z.object({
    result: z.unknown(),
    hash: api.checkConfigHash ? z.string() : z.undefined(),
  });

  const parsedFullResponse = fullSchema.safeParse(json);

  if (!parsedFullResponse.success) {
    return {
      error: parsedFullResponse.error,
    };
  }

  const parsedResult = api.resultSchema.safeParse(
    parsedFullResponse.data.result,
  );

  if (!parsedResult.success) {
    return {
      error: parsedResult.error,
    };
  }

  return { result: parsedResult.data, hash: parsedFullResponse.data.hash };
}
