import { handle } from "../api-handler";
import { logoutApi } from "../../../shared/api/admin/logout-api";

export const logoutApiHandler = handle(
  logoutApi,
  async (ctx, _params, session) => {
    if (session == null) {
      // Should never happen. This API requires authentication.
      return null;
    }

    await ctx.adminAuth.logout(session.token);
    return null;
  },
);
