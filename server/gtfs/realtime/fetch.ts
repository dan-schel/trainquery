import fetch from "node-fetch";
import { transit_realtime } from "./proto";
import fsp from "fs/promises";

export async function fetchRealtime(): Promise<transit_realtime.FeedMessage> {
  const subscriptionKey = process.env.GTFS_REALTIME_KEY;

  if (subscriptionKey == null) {
    throw new Error("GTFS_REALTIME_KEY environment variable not set.");
  }

  const response = await fetch(
    "https://data-exchange-api.vicroads.vic.gov.au/opendata/v1/gtfsr/metrotrain-tripupdates",
    {
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
      },
    },
  );

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const message = transit_realtime.FeedMessage.decode(bytes);

  await fsp.writeFile("output.txt", JSON.stringify(message.toJSON()));

  return message;
}
