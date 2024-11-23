import { createHmac } from "crypto";
import fetch from "node-fetch";

/** The origin for the PTV API. */
const ptvOrigin = "https://timetableapi.ptv.vic.gov.au";

/**
 * Returns a JSON object from the PTV API. Throws an error on failure.
 * @param api The api path, e.g. "/v3/disruptions".
 * @param args The arguments to append as search params to the url.
 * @param devID The PTV API dev ID.
 * @param devKey The PTV API key.
 */
export async function callPtvApi(
  api: string,
  args: Record<string, string | string[]>,
  devID: string,
  devKey: string,
): Promise<unknown> {
  const url = createPtvUrl(api, args, devID, devKey);
  const response = await fetch(url);

  if (response.status !== 200) {
    const ip = await myip();
    throw new Error(
      `PTV API responded with code ${response.status} (my IP address: "${ip}").`,
    );
  }

  return await response.json();
}

async function myip() {
  // TODO: Remove this - or do it properly (no "as any", use zod).
  const res = await fetch("https://ipecho.io/json");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (await res.json()) as any;
  return data.ip;
}

/**
 * Returns the PTV API url for the given API with the given arguments, signed
 * with the given dev ID and key.
 * @param api The api path, e.g. "/v3/disruptions".
 * @param args The arguments to append as search params to the url.
 * @param devID The PTV API dev ID.
 * @param devKey The PTV API key.
 */
export function createPtvUrl(
  api: string,
  args: Record<string, string | string[]>,
  devID: string,
  devKey: string,
): URL {
  const url = new URL(ptvOrigin);
  url.pathname = api;

  Object.keys(args).forEach((x) => {
    const val = args[x];

    if (Array.isArray(val)) {
      val.forEach((v) => url.searchParams.append(x, v));
    } else {
      url.searchParams.append(x, val);
    }
  });

  return signUrlPtv(devID, devKey, url);
}

/**
 * Returns the URL, signed using the given dev ID and key for usage with the PTV
 * API.
 * @param devID The PTV API dev ID.
 * @param devKey The PTV API key.
 * @param url The url.
 */
function signUrlPtv(devID: string, devKey: string, url: URL): URL {
  url.searchParams.append("devid", devID);

  const urlExceptOrigin = url.pathname + url.search;
  const hmac = createHmac("sha1", devKey);
  hmac.write(urlExceptOrigin, "utf8");
  const signature = hmac.digest("hex");
  url.searchParams.append("signature", signature);

  return url;
}
