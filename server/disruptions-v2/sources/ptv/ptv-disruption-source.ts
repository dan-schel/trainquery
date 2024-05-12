import { z } from "zod";
import { PtvConfig } from "../../../config/ptv-config";
import { EnvironmentVariables } from "../../../ctx/environment-variables";
import { TrainQuery } from "../../../ctx/trainquery";
import { ProposedDisruptionSource } from "../proposed-disruption-source";
import { QUtcDateTime } from "../../../../shared/qtime/qdatetime";
import { callPtvApi } from "./call-ptv-api";
import { nonNull } from "@dan-schel/js-utils";
import { ProposedDisruptionID } from "../../../../shared/disruptions-v2/proposed/proposed-disruption";
import { PtvProposedDisruption } from "../../../../shared/disruptions-v2/proposed/types/ptv-proposed-disruption";

// Refresh disruptions from the PTV API every 5 minutes.
const refreshInterval = 5 * 60 * 1000;

const blacklistedUrls = ["https://ptv.vic.gov.au/live-travel-updates/"];

export class PtvDisruptionSource extends ProposedDisruptionSource {
  private readonly _devID: string;
  private readonly _devKey: string;

  constructor(
    private readonly _ctx: TrainQuery,
    private readonly _ptvConfig: PtvConfig,
  ) {
    super();

    const ptv = EnvironmentVariables.get().requirePtv();
    this._devID = ptv.devId;
    this._devKey = ptv.devKey;
  }

  async init(): Promise<void> {
    await this._refresh();
    setInterval(() => this._refresh(), refreshInterval);
  }

  private async _refresh(): Promise<void> {
    try {
      this._ctx.logger.logFetchingDisruptions("ptv-api");
      const disruptions = await fetchPtvDisruptions(
        this._ptvConfig,
        this._devID,
        this._devKey,
      );
      this._ctx.logger.logFetchingDisruptionsSuccess(
        "ptv-api",
        disruptions.length,
      );
      this.supplyNewDisruptions(disruptions);
    } catch (err) {
      this._ctx.logger.logFetchingDisruptionsFailure("ptv-api", err);
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

async function fetchPtvDisruptions(
  ptvConfig: PtvConfig,
  devID: string,
  devKey: string,
) {
  const json = await callPtvApi(
    "/v3/disruptions",
    {
      route_types: ["0", "3"],
    },
    devID,
    devKey,
  );

  const result = PtvDisruptionsSchema.parse(json);
  const list = [
    ...result.disruptions.metro_train,
    ...result.disruptions.regional_train,
  ];

  return list.map((d) => {
    const lines = d.routes
      .map((r) => ptvConfig.lines.get(r) ?? null)
      .filter(nonNull);
    const stops = d.stops
      .map((r) => ptvConfig.stops.get(r) ?? null)
      .filter(nonNull);

    return new PtvProposedDisruption(
      new ProposedDisruptionID("ptv-api", d.disruption_id.toString()),
      d.from_date,
      d.to_date,
      d.title,
      d.description,
      lines,
      stops,
      d.url,
    );
  });
}
