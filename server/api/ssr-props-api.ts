import { parseIntNull } from "@schel-d/js-utils";
import { requireParam } from "../param-utils";
import { getService } from "../timetable/get-service";
import { StaticServiceIDComponents } from "../timetable/static-service-id";
import { ServerParams, TrainQuery } from "../trainquery";
import {
  departurify,
  departurifyFromOrigin,
} from "../../shared/system/timetable/departure";

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
    return aboutPage(ctx);
  } else if (page == "train") {
    return trainPage(ctx, path);
  } else {
    return {};
  }
}

function aboutPage(ctx: TrainQuery) {
  return {
    aboutMarkdown: ctx.getConfig().server.aboutMarkdown,
  };
}

function trainPage(ctx: TrainQuery, path: string) {
  const idString = path.replace(/^\/train\/([^/?]+)([/?].*)?$/, "$1");
  const id = StaticServiceIDComponents.decode(idString);
  if (id == null) {
    return {};
  }
  const service = getService(ctx, id);
  if (service == null) {
    return {};
  }

  const perspectiveString = /\?from=([0-9]+)?$/.exec(path)?.[1];
  const perspectiveIndex = parseIntNull(perspectiveString ?? "");
  const departure =
    perspectiveIndex == null
      ? departurifyFromOrigin(service)
      : departurify(service, perspectiveIndex);
  if (departure == null) {
    return {};
  }

  return {
    departure: departure.toJSON(),
  };
}
