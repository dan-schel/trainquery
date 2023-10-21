import { parseIntNull } from "@schel-d/js-utils";
import { requireParam } from "../param-utils";
import { getService } from "../timetable/get-service";
import { StaticServiceIDComponents } from "../timetable/static-service-id";
import { ServerParams, TrainQuery } from "../trainquery";
import { Departure } from "../../shared/system/service/departure";

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
  // Parse the service ID.
  const idString = path.replace(/^\/train\/([^/?]+)([/?].*)?$/, "$1");
  const id = StaticServiceIDComponents.decode(idString);
  if (id == null) {
    return {};
  }

  // Fetch the service from the timetable.
  const service = getService(ctx, id);
  if (service == null) {
    return {};
  }

  // Parse the perspective index.
  const perspectiveString = /\?from=([0-9]+)?$/.exec(path)?.[1];
  const perspectiveIndex = parseIntNull(perspectiveString ?? "");

  // Convert the service to a departure
  const departure = (() => {
    if (perspectiveIndex == null) {
      return Departure.fromService(
        service,
        service.pattern.origin.stopListIndex,
      );
    }

    const stop = service.pattern.getStop(perspectiveIndex);
    if (stop != null && !stop.express) {
      return Departure.fromService(service, stop.stopListIndex);
    }

    return null;
  })();

  if (departure == null) {
    return {};
  }
  return {
    departure: departure.toJSON(),
  };
}
