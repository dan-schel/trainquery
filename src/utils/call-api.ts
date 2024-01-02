import { z } from "zod";
import { getConfig } from "./get-config";

export async function callAPI<T extends z.ZodType>(
  endpoint: string,
  params: Record<string, string>,
  schema: T,
): Promise<z.infer<T>> {
  const paramStrings = [];
  for (const key of Object.keys(params)) {
    paramStrings.push(`${key}=${encodeURIComponent(params[key])}`);
  }

  const raw = await resilientFetch(
    paramStrings.length === 0
      ? `/api/${endpoint}`
      : `/api/${endpoint}?${paramStrings.join("&")}`,
  );

  const json = z
    .object({
      hash: z.string(),
      result: schema,
    })
    .parse(raw);

  if (getConfig().hash !== json.hash) {
    // The cached config the client has is outdated, so refresh the page to
    // load the new config!
    window.location.reload();
  }

  return json.result;
}

export async function resilientFetch(url: string) {
  const response = await multiFetch(url, [500, 2000]);
  if (!response.ok) {
    throw new Error(`Status code ${response.status} when fetching "${url}".`);
  }
  return await response.json();
}

async function multiFetch(url: string, timeouts: number[]): Promise<Response> {
  // If we're not gonna attempt to retry anyway, don't even bother catching the
  // error.
  if (timeouts.length === 0) {
    return await fetch(url);
  }

  try {
    // Just try/catch getting a response. We shouldn't retry if we get a
    // response with a bad status code because that's probably our fault!
    return await fetch(url);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, timeouts[0]));
    return await multiFetch(url, timeouts.slice(1));
  }
}
