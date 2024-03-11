import { ServerParams, TrainQuery } from "../../ctx/trainquery";

export async function testSecretApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");
  return {
    secret: Math.random() * 100,
  };
}
