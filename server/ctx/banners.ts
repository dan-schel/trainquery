import { TrainQuery } from "./trainquery";
import { Banner } from "../../shared/banner";

const staleDisruptionsBannerID = "stale-disruptions";

export class Banners {
  private _ctx: TrainQuery | null = null;

  init(ctx: TrainQuery) {
    this._ctx = ctx;
  }

  getBanners(): Banner[] {
    if (this._ctx == null) {
      return [];
    }

    const config = this._ctx.getConfig().server.banners;
    const banners: Banner[] = [];

    if (config.staleDisruptions != null && this._ctx.disruptions.isStale()) {
      banners.push(
        new Banner(
          staleDisruptionsBannerID,
          config.staleDisruptions.message,
          config.staleDisruptions.dismissable,
        ),
      );
    }

    config.custom.forEach((custom) => {
      banners.push(new Banner(custom.id, custom.message, custom.dismissable));
    });

    return banners;
  }
}
