import { z } from "zod";
import { PtvConfig } from "../../../config/ptv-config";
import { TrainQuery } from "../../../trainquery";
import { Disruption } from "../../disruption";
import { DisruptionSource, NewDisruptionsHandler } from "../disruption-source";
import { callPtvApi } from "./call-ptv-api";

// Refresh disruptions from the PTV API every 5 minutes.
const refreshInterval = 5 * 60 * 1000;

export class PtvDisruptionSource extends DisruptionSource {
  readonly devID: string;
  readonly devKey: string;

  constructor(
    readonly ctx: TrainQuery,
    readonly ptvConfig: PtvConfig,
    readonly onNewDisruptions: NewDisruptionsHandler,
  ) {
    super(onNewDisruptions);

    const devID = process.env.PTV_DEV_ID;
    if (devID == null) {
      throw new Error(`"PTV_DEV_ID" environment variable not provided.`);
    }
    this.devID = devID;

    const devKey = process.env.PTV_DEV_KEY;
    if (devKey == null) {
      throw new Error(`"PTV_DEV_KEY" environment variable not provided.`);
    }
    this.devKey = devKey;
  }

  async init(): Promise<void> {
    console.log("Initializing PTV disruption source...");

    await this._refresh();
    setInterval(() => this._refresh(), refreshInterval);
  }

  private async _refresh(): Promise<void> {
    try {
      this.ctx.logger.logFetchingDisruptions("ptv-api");
      const disruptions = await fetchPtvDisruptions(this.devID, this.devKey);
      this.ctx.logger.logFetchingDisruptionsSuccess(
        "ptv-api",
        disruptions.length,
      );
      this.onNewDisruptions(disruptions);
    } catch (err) {
      this.ctx.logger.logFetchingDisruptionsFailure("ptv-api", err);
    }
  }
}

const PtvDisruptionSchema = z.object({});
const PtvDisruptionsSchema = z.object({
  disruptions: z.object({
    metro_train: PtvDisruptionSchema.array(),
    regional_train: PtvDisruptionSchema.array(),
  }),
});

async function fetchPtvDisruptions(
  devID: string,
  devKey: string,
): Promise<Disruption[]> {
  const json = await callPtvApi(
    "/v3/disruptions",
    {
      route_types: ["0", "3"],
    },
    devID,
    devKey,
  );

  const parsed = PtvDisruptionsSchema.parse(json);

  return [];
}
