import HmacSha1 from "crypto-js/hmac-sha1";
import fetch from "node-fetch";
import { networkInterfaces } from "os";

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

  console.log(networkInterfaces());
  async function myip() {
    const res = await fetch("https://ipecho.io/json");
    const data = (await res.json()) as any;
    return data.ip;
  }

  const ip = await myip();
  console.log(ip);
  console.log(url.href);

  if (response.status !== 200) {
    throw new Error(`PTV API responded with code ${response.status}.`);
  }

  return await response.json();
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
  const signature = HmacSha1(urlExceptOrigin, devKey).toString().toUpperCase();
  url.searchParams.append("signature", signature);

  return url;
}
