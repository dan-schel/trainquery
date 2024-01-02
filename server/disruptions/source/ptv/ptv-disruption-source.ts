import { z } from "zod";
import { PtvConfig } from "../../../config/ptv-config";
import { TrainQuery } from "../../../trainquery";
import { Disruption } from "../../disruption";
import { DisruptionSource, NewDisruptionsHandler } from "../disruption-source";
import { callPtvApi } from "./call-ptv-api";
import { QUtcDateTime } from "../../../../shared/qtime/qdatetime";
import { PtvLineDisruption } from "../../types/ptv-line-disruption";
import { nonNull } from "@schel-d/js-utils";

// Refresh disruptions from the PTV API every 5 minutes.
const refreshInterval = 5 * 60 * 1000;

const blacklistedUrls = ["https://ptv.vic.gov.au/live-travel-updates/"];

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
    await this._refresh();
    setInterval(() => this._refresh(), refreshInterval);
  }

  private async _refresh(): Promise<void> {
    try {
      this.ctx.logger.logFetchingDisruptions("ptv-api");
      const disruptions = await fetchPtvDisruptions(
        this.ptvConfig,
        this.devID,
        this.devKey,
      );
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

function cleanupText(text: string) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.endsWith(".")) {
    return trimmed;
  }
  return trimmed + ".";
}

function cleanupUrl(url: string | null) {
  if (url == null) {
    return null;
  }
  const https = url.trim().replace("http://", "https://");
  if (blacklistedUrls.includes(https)) {
    return null;
  }
  return https;
}

const PtvDisruptionSchema = z.object({
  disruption_id: z.number(),
  title: z.string().transform(cleanupText),
  url: z.string().nullable().transform(cleanupUrl),
  description: z.string().transform(cleanupText),
  disruption_type: z.string(),
  published_on: QUtcDateTime.json,
  last_updated: QUtcDateTime.json,
  from_date: QUtcDateTime.json.nullable(),
  to_date: QUtcDateTime.json.nullable(),
  routes: z
    .object({
      route_id: z.number(),
    })
    .transform((x) => x.route_id)
    .array(),
  stops: z
    .object({
      stop_id: z.number(),
    })
    .transform((x) => x.stop_id)
    .array(),
});
const PtvDisruptionsSchema = z.object({
  disruptions: z.object({
    metro_train: PtvDisruptionSchema.array(),
    regional_train: PtvDisruptionSchema.array(),
  }),
});
export type PtvRawDisruptionData = z.infer<typeof PtvDisruptionSchema>;

async function fetchPtvDisruptions(
  ptvConfig: PtvConfig,
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

  const raw = PtvDisruptionsSchema.parse(json);
  const rawList = [
    ...raw.disruptions.metro_train,
    ...raw.disruptions.regional_train,
  ];

  const parsed = rawList
    .map((d) => {
      // TODO: Remove this code and do it properly!
      // <TEMP>
      if (/^.{3,30}( line)? stations?:.{10}/gi.test(d.title)) {
        return [];
      }
      // </TEMP>

      if (d.routes.length !== 0) {
        const lines = d.routes
          .map((r) => ptvConfig.lines.get(r) ?? null)
          .filter(nonNull);

        if (lines.length == null) {
          return [];
        }

        return [
          new PtvLineDisruption(
            lines,
            "unknown",
            d.title,
            d.url,
            d.from_date,
            d.to_date,
          ),
        ];
      } else {
        return [];
      }
    })
    .flat();

  return parsed;
}
