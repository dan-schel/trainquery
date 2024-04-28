import { z } from "zod";
import { PtvConfig } from "../../../config/ptv-config";
import { EnvironmentVariables } from "../../../ctx/environment-variables";
import { TrainQuery } from "../../../ctx/trainquery";
import {
  NewDisruptionsHandler,
  RawDisruptionSource,
} from "../raw-disruption-source";
import { QUtcDateTime } from "../../../../shared/qtime/qdatetime";
import { callPtvApi } from "./call-ptv-api";
import { nonNull } from "@dan-schel/js-utils";
import { RawDisruption } from "../../../../shared/disruptions-v2/disruption";

// Refresh disruptions from the PTV API every 5 minutes.
const refreshInterval = 5 * 60 * 1000;

const blacklistedUrls = ["https://ptv.vic.gov.au/live-travel-updates/"];

export class PtvDisruptionSource extends RawDisruptionSource {
  private readonly _devID: string;
  private readonly _devKey: string;

  constructor(
    private readonly _ctx: TrainQuery,
    private readonly _ptvConfig: PtvConfig,
    onNewDisruptions: NewDisruptionsHandler,
  ) {
    super(onNewDisruptions);

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
      this.onNewDisruptions(disruptions);
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
): Promise<RawDisruption[]> {
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
      const lines = d.routes
        .map((r) => ptvConfig.lines.get(r) ?? null)
        .filter(nonNull);
      const stops = d.stops
        .map((r) => ptvConfig.stops.get(r) ?? null)
        .filter(nonNull);

      // TODO: I will return a list of RawDisruption here, but how will the
      // automatic disruptions be created later? RawDisruption has markdown, but
      // I don't want to have to parse markdown to build the auto disruptions.
      // Should RawDisruption have a custom data field? Should it be a base
      // class that PtvRawDisruption inherits from like how the disruption-v1
      // stuff currently does it? When we compare the hash to see if any changes
      // occured it probably makes more to sense to compare the custom data
      // field than it's markdown representation. We will need to keep the
      // markdown representation regardless though, so it can be viewed in the
      // admin dashboard.

      // const ptvData = new PtvRawDisruptionData(
      //   d.disruption_id,
      //   d.title,
      //   d.description,
      //   lines,
      //   stops,
      //   d.url,
      //   d.from_date,
      //   d.to_date,
      // );

      const hasStopVibes = /^.{3,30}( line)? stations?:.{10}/gi.test(d.title);

      if (lines.length !== 0 && !hasStopVibes) {
        return [
          // new PtvGeneralDisruption(ptvData, lines, [])
        ];
      } else if (stops.length !== 0) {
        return [
          // new PtvGeneralDisruption(ptvData, [], stops)
        ];
      } else {
        return [];
      }
    })
    .flat();

  return parsed;
}
