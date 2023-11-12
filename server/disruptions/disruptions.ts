import { TrainQuery } from "../trainquery";
import { Disruption } from "./disruption";
import { DisruptionSource } from "./source/disruption-source";
import { PtvDisruptionSource } from "./source/ptv/ptv-disruption-source";

export class Disruptions {
  private _ctx: TrainQuery | null = null;
  private _sources: DisruptionSource[] | null = null;
  private _disruptions: Disruption[] = [];

  async init(ctx: TrainQuery) {
    this._ctx = ctx;

    this._sources = [];

    const ptvConfig = ctx.getConfig().server.ptv;
    if (!ctx.isOffline && ptvConfig != null) {
      this._sources.push(
        new PtvDisruptionSource(
          this._ctx,
          ptvConfig,
          this.handleNewDisruptions,
        ),
      );
    }

    for (const source of this._sources) {
      await source.init();
    }
  }

  get all(): Disruption[] {
    return this._disruptions;
  }

  handleNewDisruptions(disruptions: Disruption[]) {
    this._disruptions = disruptions;
  }
}
