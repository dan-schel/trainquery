import { ServerParams, TrainQuery } from "../../ctx/trainquery";

export async function logoutApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  const session = await ctx.adminAuth.throwUnlessAuthenticated(params, "any");
  await ctx.adminAuth.logout(session.token);
  return {};
}
