import { ServerParams, TrainQuery } from "../../ctx/trainquery";

export async function logoutApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  const session = ctx.adminAuth.throwUnlessAuthenticated(params, "any");
  ctx.adminAuth.logout(session.token);
  return {};
}
