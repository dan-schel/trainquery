import { requireParam } from "../param-utils";
import { ServerParams, TrainQuery } from "../ctx/trainquery";
import { getTrainPageProps } from "./ssr-props/train-page";
import { getAboutPageProps } from "./ssr-props/about-page";
import { getAboutLegalPageProps } from "./ssr-props/about-legal-page";

export async function ssrAppPropsApi(ctx: TrainQuery): Promise<object> {
  return {
    configHash: ctx.getConfig().hash,
    banners: ctx.banners.getBanners().map((x) => x.toJSON()),
  };
}

export async function ssrRoutePropsApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  const page = requireParam(params, "page");
  const path = requireParam(params, "path");

  if (page === "about") {
    return getAboutPageProps(ctx);
  } else if (page === "about-legal") {
    return getAboutLegalPageProps(ctx);
  } else if (page === "train") {
    return await getTrainPageProps(ctx, path);
  } else {
    return {};
  }
}
