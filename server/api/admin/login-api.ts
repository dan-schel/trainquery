import { BadApiCallError } from "../../param-utils";
import { handle } from "../api-handler";
import { loginApi } from "../../../shared/api/admin/login-api";

let rateLimited = false;

// Only allow one login attempt every 1000 milliseconds (1 second).
// TODO: Yeah I know this is kinda dumb. Shrug.
const attemptTimeout = 1000;

export const loginApiHandler = handle(
  loginApi,
  async (ctx, { username, password }) => {
    if (rateLimited) {
      throw new BadApiCallError("Too many requests.", 429);
    }

    rateLimited = true;
    setTimeout(() => {
      rateLimited = false;
    }, attemptTimeout);

    return await ctx.adminAuth.login(username, password);
  },
);
