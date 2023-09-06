import { ServerParams, TrainQuery, requireParam } from "../trainquery";

export async function ssrAppPropsApi(ctx: TrainQuery): Promise<object> {
  return { configHash: ctx.getConfig().hash };
}

export async function ssrRoutePropsApi(
  ctx: TrainQuery,
  params: ServerParams
): Promise<object> {
  const page = requireParam(params, "page");

  return { page: page };
}
