import { ServerParams, TrainQuery } from "./trainquery";

export async function ssrAppPropsApi(ctx: TrainQuery) {
  return { configHash: ctx.getConfig().hash };
}

export async function ssrRoutePropsApi(ctx: TrainQuery, params: ServerParams) {
  const page = params.page;

  return { page: page };
}
