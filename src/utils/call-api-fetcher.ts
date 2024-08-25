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

export async function fetchApi<
  ParamsSchema extends z.ZodTypeAny,
  ResultSchema extends z.ZodTypeAny,
>(
  api: ApiDefinition<ParamsSchema, ResultSchema>,
  params: z.infer<ParamsSchema>,
  authSession: Session | null,
): Promise<FetchResult<z.infer<ResultSchema>>> {
  try {
    const response = await fetch(`/api/${api.endpoint}`, {
      method: "POST",
      body: JSON.stringify(api.paramsSerializer(params)),
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
    const parsed = z
      .object({
        result: api.resultSchema,
        hash: api.checkConfigHash ? z.string() : z.undefined(),
      })
      .safeParse(json);

    if (!parsed.success) {
      // The result JSON is in an unexpected format. No point retrying.
      return {
        type: "error",
        worthRetrying: false,
        error: parsed.error,
        httpCode: null,
      };
    }

    // The type assertions here are required because Typescript can't infer the
    // correct type from z.ZodTypeAny.
    // (More info: https://zod.dev/?id=inferring-the-inferred-type)
    const result = parsed.data.result as z.infer<ResultSchema>;
    const hash = parsed.data.hash as string | undefined;

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
