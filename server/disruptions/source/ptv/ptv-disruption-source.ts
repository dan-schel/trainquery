import { z } from "zod";
import { PtvConfig } from "../../../config/ptv-config";
import { TrainQuery } from "../../../ctx/trainquery";
import { Disruption } from "../../disruption";
import { DisruptionSource, NewDisruptionsHandler } from "../disruption-source";
import { callPtvApi } from "./call-ptv-api";
import { QUtcDateTime } from "../../../../shared/qtime/qdatetime";
import { PtvLineDisruption } from "../../types/ptv-line-disruption";
import { nonNull } from "@dan-schel/js-utils";
import { EnvironmentVariables } from "../../../ctx/environment-variables";
import { PtvStopDisruption } from "../../types/ptv-stop-disruption";

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

    const ptv = EnvironmentVariables.get().requirePtv();
    this.devID = ptv.devId;
    this.devKey = ptv.devKey;
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
      const hasStopVibes = /^.{3,30}( line)? stations?:.{10}/gi.test(d.title);

      if (d.routes.length !== 0 && !hasStopVibes) {
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
      } else if (d.stops.length !== 0) {
        const stops = d.stops
          .map((r) => ptvConfig.stops.get(r) ?? null)
          .filter(nonNull);

        if (stops.length == null) {
          return [];
        }
        return [
          new PtvStopDisruption(stops, d.title, d.url, d.from_date, d.to_date),
        ];
      } else {
        return [];
      }
    })
    .flat();

  return parsed;
}
