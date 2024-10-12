import { TrainQuery } from "../../ctx/trainquery";
import { RequestBuilder } from "../../external-data/requests";
import { Subsystem, SubsystemBuilder, SubsystemCtx } from "../subsystem";
import {
  KnownPlatforms,
  PlatformsExternalData,
} from "./platforms-external-data";

export class PtvPlatformsSubsystem extends Subsystem {
  static readonly id = "ptv-platforms";

  constructor(
    ctx: SubsystemCtx,
    readonly platforms: PlatformsExternalData,
  ) {
    super(ctx, PtvPlatformsSubsystem.id);
  }

  ready(_ctx: TrainQuery): void {
    this.platforms.startPolling();
  }

  getKnownPlatforms(): KnownPlatforms {
    return this.platforms.get();
  }
}

export class PtvPlatformsSubsystemBuilder extends SubsystemBuilder {
  constructor(private readonly platformsApi: RequestBuilder[]) {
    super(PtvPlatformsSubsystem.id);
  }

  async build(ctx: SubsystemCtx): Promise<Subsystem> {
    const platforms = new PlatformsExternalData(
      ctx,
      this.platformsApi,
      ctx.logger,
    );
    await platforms.init({ startPolling: false });

    return new PtvPlatformsSubsystem(ctx, platforms);
  }
}
