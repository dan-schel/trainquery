import fetch, { Response } from "node-fetch";
import { transit_realtime } from "./proto";
import { nonNull } from "@dan-schel/js-utils";
import {
  GtfsRealtimeAuthMethod,
  GtfsRealtimeConfig,
} from "../../config/gtfs-config";
import { EnvironmentVariables } from "../../ctx/environment-variables";
import { z } from "zod";

export type GtfsRealtimeData = {
  tripUpdates: transit_realtime.ITripUpdate[];
  serviceAlerts: transit_realtime.IAlert[];
  vehiclePositions: transit_realtime.IVehiclePosition[];
};

export async function fetchRealtime(
  config: GtfsRealtimeConfig,
): Promise<GtfsRealtimeData> {
  const results = await Promise.all(
    config.apis.map((api) => fetchRealtimeApi(api, config.apiAuth)),
  );

  const combined = results.map((e) => e.entity).flat();
  return {
    tripUpdates: combined.map((e) => e.tripUpdate ?? null).filter(nonNull),
    serviceAlerts: combined.map((e) => e.alert ?? null).filter(nonNull),
    vehiclePositions: combined.map((e) => e.vehicle ?? null).filter(nonNull),
  };
}

async function fetchRealtimeApi(
  api: string,
  apiAuth: GtfsRealtimeAuthMethod,
): Promise<transit_realtime.FeedMessage> {
  const response = await buildRequest(api, apiAuth);

  if (apiAuth === "relay") {
    // TODO: The relay processes the data before sending it to us, so the
    // parsing logic is a bit different when we get it from the relay. Notably,
    // the relay sends JSON, and combines the three feeds into one.
    //
    // This code is a bit ugly though.
    //
    // Solutions could include:
    // - Expose protobuf binary on the relay (downside: json download at
    //   vtar.trainquery.com is nice for debugging).
    // - Expose multiple endpoints on the relay, one for each feed (downside:
    //   multiple downloads necessary, including when debugging).
    // - Combine the feeds together in VTAR, but respond in FeedMessage format,
    //   not this custom mess we've got right now (downside: how to choose which
    //   header to pass on).
    //
    // Except in the case of solution 1, there should be a "format" field in the
    // GtfsRealtimeConfig.
    //
    // My favourite solution at the time of writing is solution 3.
    const json = await response.json();
    const schema = z.object({
      tripUpdates: z.array(z.unknown()),
      serviceAlerts: z.array(z.unknown()),
      vehiclePositions: z.array(z.unknown()),
    });
    const data = schema.parse(json);
    const message = transit_realtime.FeedMessage.fromObject({
      header: {
        gtfsRealtimeVersion: "1.0", // IDK, but TrainQuery doesn't care.
      },
      entity: [
        ...data.tripUpdates.map((x) => ({ tripUpdate: x })),
        ...data.serviceAlerts.map((x) => ({ alert: x })),
        ...data.vehiclePositions.map((x) => ({ vehicle: x })),
      ],
    });
    return message;
  } else {
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const message = transit_realtime.FeedMessage.decode(bytes);
    return message;
  }
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
  } else if (apiAuth === "relay") {
    const key = EnvironmentVariables.get().requireRelayKey();
    return fetch(api, {
      headers: {
        "relay-key": key,
      },
    });
  } else {
    throw new Error(
      `GTFS-R API authentication method "${apiAuth}" is not supported.`,
    );
  }
}
