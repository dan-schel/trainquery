import { z } from "zod";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { FullConfig } from "../../config/computed-config";
import { Logger } from "../../ctx/logger";
import { TrainQuery } from "../../ctx/trainquery";
import { TrainQueryDB } from "../../ctx/trainquery-db";
import { PolledExternalData } from "../../external-data/polled-external-data";
import { Subsystem } from "../subsystem";
import { IntStringJson, mapJson } from "../../../shared/utils";

const knownPlatform = z.object({
  terminus: z.number().nullable(),
  terminusName: z.string(),
  scheduledDepartureUtc: QUtcDateTime.json,
  platform: z.string(),
});
const knownPlatforms = mapJson(IntStringJson, knownPlatform);

type KnownPlatform = z.infer<typeof knownPlatform>;
type KnownPlatforms = z.infer<typeof knownPlatforms>;

export class PtvPlatformsSubsystem extends Subsystem<{
  platforms: PlatformsExternalData;
}> {
  static readonly id = "ptv-platforms";

  constructor(/* ptv platforms config */) {
    super(PtvPlatformsSubsystem.id);
  }

  protected async onInit(
    _config: FullConfig,
    logger: Logger,
    _database: TrainQueryDB | null,
  ): Promise<{ platforms: PlatformsExternalData }> {
    const platforms = new PlatformsExternalData(
      logger,
      /* ptv platforms config */
    );
    await platforms.init({ startPolling: false });
    return { platforms };
  }

  protected onReady(
    _ctx: TrainQuery,
    { platforms }: { platforms: PlatformsExternalData },
  ): void {
    platforms.startPolling();
  }

  getKnownPlatforms(): KnownPlatforms {
    return this.requirePostInitData().platforms.get();
  }
}

class PlatformsExternalData extends PolledExternalData<KnownPlatforms> {
  constructor(private readonly _logger: Logger /* ptv platforms config */) {
    super(60000);
  }

  protected async fetch() {
    return new Map<number, KnownPlatform>();
  }

  protected onError(e: unknown): void {
    this._logger.logPtvPlatformsError(e);
  }
}
