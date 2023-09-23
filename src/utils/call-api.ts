import { z } from "zod";
import { getConfig } from "./get-config";

export async function callAPI<T extends z.ZodType>(
  endpoint: string,
  params: Record<string, string>,
  schema: T
): Promise<z.infer<T>> {
  const paramStrings = [];
  for (const key of Object.keys(params)) {
    paramStrings.push(`${key}=${encodeURIComponent(params[key])}`);
  }

  const raw = await resiliantFetch(
    paramStrings.length == 0
      ? `/api/${endpoint}`
      : `/api/${endpoint}?${paramStrings.join("&")}`
  );

  const json = z
    .object({
      hash: z.string(),
      result: schema,
    })
    .parse(raw);

  if (getConfig().hash != json.hash) {
    // The cached config the client has is outdated, so refresh the page to
    // load the new config!
    window.location.reload();
  }

  return json.result;
}

export async function resiliantFetch(url: string) {
  // TODO: This is not resiliant!
  const response = await fetch(url);
  return response.json();
}
