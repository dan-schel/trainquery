import { TrainQuery } from "../../ctx/trainquery";
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
  constructor(/* ptv platforms config */) {
    super(PtvPlatformsSubsystem.id);
  }

  async build(ctx: SubsystemCtx): Promise<Subsystem> {
    const platforms = new PlatformsExternalData(
      ctx.logger,
      /* ptv platforms config */
    );
    await platforms.init({ startPolling: false });

    return new PtvPlatformsSubsystem(ctx, /* ptv platforms config */ platforms);
  }
}
