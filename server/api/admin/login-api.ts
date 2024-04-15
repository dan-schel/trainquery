import { ServerParams, TrainQuery } from "../../ctx/trainquery";
import { BadApiCallError, requireBodyParam } from "../../param-utils";

let rateLimited = false;

// Only allow one login attempt every 1000 milliseconds (1 second).
const attemptTimeout = 1000;

export async function loginApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  if (rateLimited) {
    throw new BadApiCallError("Too many requests.", 429);
  }

  rateLimited = true;
  setTimeout(() => {
    rateLimited = false;
  }, attemptTimeout);

  const username = requireBodyParam(params, "username");
  const password = requireBodyParam(params, "password");
  const session = await ctx.adminAuth.login(username, password);
  return { session };
}
