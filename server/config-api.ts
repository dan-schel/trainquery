import { TrainQuery } from "./trainquery";

export async function configApi(ctx: TrainQuery) {
  return ctx.getConfig().forFrontend().toJSON();
}
