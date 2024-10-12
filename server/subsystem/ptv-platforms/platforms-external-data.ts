import { z } from "zod";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { mapJson, IntStringJson } from "../../../shared/utils";
import { PolledExternalData } from "../../external-data/polled-external-data";
import { Logger } from "../../ctx/logger";
import {
  RelayRequestBuilder,
  RequestBuilder,
} from "../../external-data/requests";

// Refresh PTV Platforms from the relay every 60 seconds.
const refreshMs = 60 * 1000;

const knownPlatformJson = z.object({
  terminus: z.number().nullable(),
  terminusName: z.string(),
  scheduledDepartureTime: QUtcDateTime.json,
  platform: z.string(),
});
const knownPlatformsJson = mapJson(IntStringJson, knownPlatformJson.array());

export type KnownPlatform = z.infer<typeof knownPlatformJson>;
export type KnownPlatforms = z.infer<typeof knownPlatformsJson>;

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
    return knownPlatformsJson.parse(json);
  }

  protected onError(e: unknown): void {
    this._logger.logFetchingPtvPlatformsFailure(e);
  }
}
