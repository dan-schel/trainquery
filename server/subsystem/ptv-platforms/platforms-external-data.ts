import { z } from "zod";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { mapJson, IntStringJson } from "../../../shared/utils";
import { PolledExternalData } from "../../external-data/polled-external-data";
import { Logger } from "../../ctx/logger";
import { RequestBuilder } from "../../external-data/requests";
import { PlatformID, StopID } from "../../../shared/system/ids";
import { PtvConfig } from "../../config/ptv-config";
import { SubsystemCtx } from "../subsystem";
import { nonNull } from "@dan-schel/js-utils";
import { Stop } from "../../../shared/system/stop";

// Refresh PTV Platforms from the relay every 60 seconds.
const refreshMs = 60 * 1000;

const knownPlatformJson = z.object({
  terminus: z.number().nullable(),
  terminusName: z.string(),
  scheduledDepartureTime: QUtcDateTime.json,
  platform: z.string(),
});
const knownPlatformsJson = mapJson(IntStringJson, knownPlatformJson.array());

export type RawKnownPlatform = z.infer<typeof knownPlatformJson>;

export type KnownPlatform = {
  terminus: StopID;
  scheduledDepartureTime: QUtcDateTime;
  platform: PlatformID;
};

export type KnownPlatforms = Map<StopID, KnownPlatform[]>;

export class PlatformsExternalData extends PolledExternalData<KnownPlatforms> {
  constructor(
    private readonly ctx: SubsystemCtx,
    private readonly platformsApi: RequestBuilder[],
    private readonly _logger: Logger,
  ) {
    super(refreshMs);
  }

  protected async fetch() {
    const responses = await Promise.all(this.platformsApi.map((x) => x.call()));
    const jsons = await Promise.all(responses.map((x) => x.json()));
    const parsedJsons = knownPlatformsJson.array().parse(jsons);

    const result = new Map<StopID, KnownPlatform[]>();

    // The stop ID mapping can change with the network data, but ptvConfig is
    // only the initial value. :/
    const currentPtvConfig = this.ctx.getConfig().server.ptv;
    const currentStops = this.ctx.getConfig().shared.stops;
    if (currentPtvConfig == null) {
      throw new Error("PTV Config no longer set?");
    }

    for (const rawKnownPlatforms of parsedJsons) {
      for (const [ptvStopId, rawKnownPlatform] of rawKnownPlatforms) {
        const stopID = this._getStopID(ptvStopId, currentPtvConfig);

        const knownPlatforms: KnownPlatform[] = rawKnownPlatform
          .map((data) => {
            const terminus: StopID = this._getStopIDWithNameBackup(
              data.terminus,
              data.terminusName,
              currentPtvConfig,
              currentStops,
            );
            const platform = this._getPlatformID(
              stopID,
              data.platform,
              currentStops,
            );

            if (platform == null) {
              return null;
            }

            return {
              terminus,
              scheduledDepartureTime: data.scheduledDepartureTime,
              platform,
            };
          })
          .filter(nonNull);

        result.set(stopID, [...(result.get(stopID) ?? []), ...knownPlatforms]);
      }
    }

    return result;
  }

  private _getStopID(ptvStopID: number, currentPtvConfig: PtvConfig): StopID {
    const value = currentPtvConfig.stops.get(ptvStopID);
    if (value == null) {
      throw new Error(`Unknown PTV stop ID: ${ptvStopID}`);
    }
    return value;
  }

  private _getStopIDWithNameBackup(
    ptvStopID: number | null,
    stopName: string,
    currentPtvConfig: PtvConfig,
    currentStops: Stop[],
  ): StopID {
    if (ptvStopID != null) {
      return this._getStopID(ptvStopID, currentPtvConfig);
    }

    const stop = currentStops.find((x) => x.name === stopName);
    if (stop == null) {
      throw new Error(`Unknown stop name: ${stopName}`);
    }

    return stop.id;
  }

  private _getPlatformID(
    stopID: StopID,
    ptvPlatformID: string,
    currentStops: Stop[],
  ): PlatformID | null {
    const stop = currentStops.find((x) => x.id === stopID);
    if (stop == null) {
      throw new Error(`Unknown stop ID: ${stopID}`);
    }

    const platform = stop.platforms.find((x) => x.id === ptvPlatformID);
    if (platform == null) {
      this._logger.logUnknownPtvPlatform(stop.name, ptvPlatformID);
      return null;
    }

    return platform.id;
  }

  protected onError(e: unknown): void {
    this._logger.logFetchingPtvPlatformsFailure(e);
  }
}
