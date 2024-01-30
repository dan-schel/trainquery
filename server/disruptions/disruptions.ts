import { Departure } from "../../shared/system/service/departure";
import { TrainQuery } from "../ctx/trainquery";
import { Disruption } from "./disruption";
import { DisruptionSource } from "./source/disruption-source";
import { PtvDisruptionSource } from "./source/ptv/ptv-disruption-source";
import { DepartureWithDisruptions } from "../../shared/disruptions/departure-with-disruptions";

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
        new PtvDisruptionSource(this._ctx, ptvConfig, (d) =>
          this.handleNewDisruptions(d),
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

  determineDisruptions(departure: Departure): DepartureWithDisruptions {
    const ctx = this._requireCtx();
    const disruptions = this._disruptions.filter((d) =>
      d.affectsService(ctx, departure),
    );
    return new DepartureWithDisruptions(
      departure,
      disruptions.map((d) => d.toJSON(ctx)),
    );
  }

  private _requireCtx(): TrainQuery {
    if (this._ctx == null) {
      throw new Error("Call init() first.");
    }
    return this._ctx;
  }
}
