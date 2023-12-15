import fetch from "node-fetch";
import { transit_realtime } from "./proto";
import fsp from "fs/promises";
import path from "path";
import { nonNull } from "@schel-d/js-utils";

export type GtfsRealtimeData = {
  tripUpdates: transit_realtime.ITripUpdate[];
  serviceAlerts: transit_realtime.IAlert[];
  vehiclePositions: transit_realtime.IVehiclePosition[];
};

export async function fetchRealtime(): Promise<GtfsRealtimeData> {
  const key = process.env.GTFS_REALTIME_KEY;

  if (key == null) {
    throw new Error("GTFS_REALTIME_KEY environment variable not set.");
  }

  const tripUpdates = await fetchToFile(
    "tripupdates",
    key,
    "data-output/trip-updates.txt",
  );
  const serviceAlerts = await fetchToFile(
    "servicealerts",
    key,
    "data-output/service-alerts.txt",
  );
  const vehiclePositions = await fetchToFile(
    "vehicleposition-updates",
    key,
    "data-output/vehicle-positions.txt",
  );

  const combined = [
    ...tripUpdates.entity,
    ...serviceAlerts.entity,
    ...vehiclePositions.entity,
  ];
  return {
    tripUpdates: combined.map((e) => e.tripUpdate ?? null).filter(nonNull),
    serviceAlerts: combined.map((e) => e.alert ?? null).filter(nonNull),
    vehiclePositions: combined.map((e) => e.vehicle ?? null).filter(nonNull),
  };
}

async function fetchToFile(
  api: string,
  subscriptionKey: string,
  file: string,
): Promise<transit_realtime.FeedMessage> {
  const response = await fetch(
    `https://data-exchange-api.vicroads.vic.gov.au/opendata/v1/gtfsr/metrotrain-${api}`,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    },
  );

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const message = transit_realtime.FeedMessage.decode(bytes);

  await fsp.mkdir(path.dirname(file), { recursive: true });
  await fsp.writeFile(file, JSON.stringify(message.toJSON(), null, 2));

  return message;
}
