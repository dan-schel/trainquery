import { TrainQuery } from "../ctx/trainquery";

export async function configApi(ctx: TrainQuery): Promise<object> {
  return ctx.getConfig().forFrontend().toJSON();
}
