import fetch from "node-fetch";
import { transit_realtime } from "./proto";
import fsp from "fs/promises";

export async function fetchRealtime() {
  const key = process.env.GTFS_REALTIME_KEY;

  if (key == null) {
    throw new Error("GTFS_REALTIME_KEY environment variable not set.");
  }

  await fetchToFile("tripupdates", key, "_trip-updates.txt");
  await fetchToFile("servicealerts", key, "_service-alerts.txt");
  await fetchToFile("vehicleposition-updates", key, "_vehicle-positions.txt");
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

  await fsp.writeFile(file, JSON.stringify(message.toJSON()));

  return message;
}
