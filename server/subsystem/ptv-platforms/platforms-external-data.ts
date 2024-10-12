import { z } from "zod";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { mapJson, IntStringJson } from "../../../shared/utils";
import { PolledExternalData } from "../../external-data/polled-external-data";
import { Logger } from "../../ctx/logger";

// Refresh PTV Platforms from the relay every 60 seconds.
const refreshMs = 60 * 1000;

const knownPlatform = z.object({
  terminus: z.number().nullable(),
  terminusName: z.string(),
  scheduledDepartureUtc: QUtcDateTime.json,
  platform: z.string(),
});
const knownPlatforms = mapJson(IntStringJson, knownPlatform);

export type KnownPlatform = z.infer<typeof knownPlatform>;
export type KnownPlatforms = z.infer<typeof knownPlatforms>;

export class PlatformsExternalData extends PolledExternalData<KnownPlatforms> {
  constructor(private readonly _logger: Logger /* ptv platforms config */) {
    super(refreshMs);
  }

  protected async fetch() {
    return new Map<number, KnownPlatform>();
  }

  protected onError(e: unknown): void {
    this._logger.logFetchingPtvPlatformsFailure(e);
  }
}
