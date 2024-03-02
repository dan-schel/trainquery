import { parseIntNull } from "@dan-schel/js-utils";
import { Departure } from "../../../shared/system/service/departure";
import {
  getGtfsService,
  getTimetableService,
} from "../../timetable/get-service";
import { StaticServiceIDComponents } from "../../timetable/static-service-id";
import { TrainQuery } from "../../ctx/trainquery";
import { CompletePattern } from "../../../shared/system/service/complete-pattern";
import { Service } from "../../../shared/system/service/service";
import { GtfsServiceIDComponents } from "../../gtfs/gtfs-service-id";

export async function getTrainPageProps(ctx: TrainQuery, path: string) {
  const url = new URL(path, "https://example.com");
  const pieces = url.pathname.split("/").filter((x) => x.length !== 0);
  if (pieces.length !== 3) {
    return {};
  }

  const [, source, idStringss] = pieces;

  let service: Service<CompletePattern> | null = null;
  if (source === "ttbl") {
    service = getTtblTrain(ctx, idStringss);
  } else if (source === "gtfs") {
    service = await getGtfsTrain(ctx, idStringss);
  }

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

  const departureWithDisruptions =
    ctx.disruptions.determineDisruptions(departure);

  return {
    departure: departureWithDisruptions.toJSON(),
  };
}

function getTtblTrain(
  ctx: TrainQuery,
  idString: string,
): Service<CompletePattern> | null {
  // Parse the service ID.
  const id = StaticServiceIDComponents.decode(idString);
  if (id == null) {
    return null;
  }

  // Fetch the service from the timetable.
  return getTimetableService(ctx, id);
}

async function getGtfsTrain(
  ctx: TrainQuery,
  idString: string,
): Promise<Service<CompletePattern> | null> {
  // Parse the service ID.
  const id = GtfsServiceIDComponents.decode(idString);
  if (id == null) {
    return null;
  }

  // Fetch the service from the GTFS data.
  return await getGtfsService(ctx, id);
}
