import { requireParam } from "../param-utils";
import { ServerParams, TrainQuery } from "../trainquery";
import { getTrainPageProps } from "./ssr-props/train-page";

export async function ssrAppPropsApi(ctx: TrainQuery): Promise<object> {
  return { configHash: ctx.getConfig().hash };
}

export async function ssrRoutePropsApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  const page = requireParam(params, "page");
  const path = requireParam(params, "path");

  if (page == "about") {
    return getAboutPageProps(ctx);
  } else if (page == "train") {
    return getTrainPageProps(ctx, path);
  } else {
    return {};
  }
}

function getAboutPageProps(ctx: TrainQuery) {
  return {
    aboutMarkdown: ctx.getConfig().server.aboutMarkdown,
  };
}
