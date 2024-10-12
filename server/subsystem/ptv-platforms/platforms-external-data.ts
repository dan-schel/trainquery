import { z } from "zod";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { mapJson, IntStringJson } from "../../../shared/utils";
import { PolledExternalData } from "../../external-data/polled-external-data";
import { Logger } from "../../ctx/logger";
import {
  RelayRequestBuilder,
  RequestBuilder,
} from "../../external-data/requests";
import { PlatformID, StopID, toPlatformID } from "../../../shared/system/ids";

// Refresh PTV Platforms from the relay every 60 seconds.
const refreshMs = 60 * 1000;

const knownPlatformJson = z.object({
  terminus: z.number().nullable(),
  terminusName: z.string(),
  scheduledDepartureTime: QUtcDateTime.json,
  platform: z.string(),
});
const knownPlatformsJson = mapJson(IntStringJson, knownPlatformJson.array());

// Not using z.infer here, because knownPlatformJson.terminus is the PTV stop
// ID, not a TrainQuery StopID. Same with platform, and for the KnownPlatforms
// map key. We also process the terminus name.
export type KnownPlatform = {
  terminus: StopID;
  scheduledDepartureTime: QUtcDateTime;
  platform: PlatformID;
};
export type KnownPlatforms = Map<StopID, KnownPlatform[]>;

export class PlatformsExternalData extends PolledExternalData<KnownPlatforms> {
  private readonly requestBuilder: RequestBuilder;

  constructor(private readonly _logger: Logger /* ptv platforms config */) {
    super(refreshMs);

    // TODO: Build this from the PTV platforms config.
    this.requestBuilder = new RelayRequestBuilder(
      "https://vtar.trainquery.com/ptv-platforms.json",
    );
  }

  protected async fetch() {
    const response = await this.requestBuilder.call();
    const json = await response.json();
    const parsed = knownPlatformsJson.parse(json);
    const entries = Array.from(parsed.entries());

    return new Map<StopID, KnownPlatform[]>(
      entries.map((x) => {
        const [ptvStopId, rawKnownPlatforms] = x;

        // TODO: Map the PTV stop ID to a TrainQuery StopID.
        const stopID: StopID = ptvStopId;

        const knownPlatforms: KnownPlatform[] = rawKnownPlatforms.map(
          (data) => {
            // TODO: Map the PTV stop ID to a TrainQuery StopID, or use the name
            // as backup (in the case of Southern Cross V/Line departures).
            const terminus: StopID = data.terminus ?? data.terminusName;

            // TODO: Just hope the platform string from PTV matches TrainQuery's
            // platform IDs?
            const platform = toPlatformID(data.platform);

            return {
              terminus,
              scheduledDepartureTime: data.scheduledDepartureTime,
              platform,
            };
          },
        );

        return [stopID, knownPlatforms];
      }),
    );
  }

  protected onError(e: unknown): void {
    this._logger.logFetchingPtvPlatformsFailure(e);
  }
}
