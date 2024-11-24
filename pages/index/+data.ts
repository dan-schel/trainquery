// import fetch from "node-fetch";

import { PageContext } from "vike/types";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContext) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const ctx = pageContext.tqCtx;

  return {
    favStopName: ctx.getConfig().shared.stops[12].name,
  };
}
