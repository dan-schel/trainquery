import { requireParam } from "../param-utils";
import { getService } from "../timetable/get-service";
import { StaticServiceIDComponents } from "../timetable/static-service-id";
import { ServerParams, TrainQuery } from "../trainquery";

export async function ssrAppPropsApi(ctx: TrainQuery): Promise<object> {
  return { configHash: ctx.getConfig().hash };
}

export async function ssrRoutePropsApi(
  ctx: TrainQuery,
  params: ServerParams
): Promise<object> {
  const page = requireParam(params, "page");
  const path = requireParam(params, "path");

  if (page == "about") {
    return {
      aboutMarkdown: ctx.getConfig().server.aboutMarkdown,
    };
  } else if (page == "train") {
    const idString = path.replace(/^\/train\/([^/?]+)(.+)$/, "$1");
    const id = StaticServiceIDComponents.decode(idString);
    if (id == null) {
      return {};
    }
    const service = getService(ctx, id);
    if (service == null) {
      return {};
    }
    return {
      service: service.toJSON(),
    };
  } else {
    return {};
  }
}
