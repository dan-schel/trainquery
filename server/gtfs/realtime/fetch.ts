import fetch, { Response } from "node-fetch";
import { transit_realtime } from "./proto";
import { nonNull } from "@schel-d/js-utils";
import {
  GtfsRealtimeAuthMethod,
  GtfsRealtimeConfig,
} from "../../config/gtfs-config";
import { EnvironmentVariables } from "../../ctx/environment-variables";

export type GtfsRealtimeData = {
  tripUpdates: transit_realtime.ITripUpdate[];
  serviceAlerts: transit_realtime.IAlert[];
  vehiclePositions: transit_realtime.IVehiclePosition[];
};

export async function fetchRealtime(
  config: GtfsRealtimeConfig,
): Promise<GtfsRealtimeData> {
  const results = await Promise.all(
    config.apis.map((api) => fetchToFile(api, config.apiAuth)),
  );

  const combined = results.map((e) => e.entity).flat();
  return {
    tripUpdates: combined.map((e) => e.tripUpdate ?? null).filter(nonNull),
    serviceAlerts: combined.map((e) => e.alert ?? null).filter(nonNull),
    vehiclePositions: combined.map((e) => e.vehicle ?? null).filter(nonNull),
  };
}

async function fetchToFile(
  api: string,
  apiAuth: GtfsRealtimeAuthMethod,
): Promise<transit_realtime.FeedMessage> {
  const response = await buildRequest(api, apiAuth);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const message = transit_realtime.FeedMessage.decode(bytes);
  return message;
}

function buildRequest(
  api: string,
  apiAuth: GtfsRealtimeAuthMethod,
): Promise<Response> {
  if (apiAuth === "none") {
    return fetch(api);
  } else if (apiAuth === "melbourne") {
    const key = EnvironmentVariables.get().requireGtfsRealtimeKey();
    return fetch(api, {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
      },
    });
  } else {
    throw new Error(
      `GTFS-R API authentication method "${apiAuth}" is not supported.`,
    );
  }
}
