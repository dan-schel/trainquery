import { Departure } from "../../shared/system/service/departure";
import { TrainQuery } from "../ctx/trainquery";
import { Disruption } from "./disruption";
import { DisruptionSource } from "./source/disruption-source";
import { PtvDisruptionSource } from "./source/ptv/ptv-disruption-source";
import { DepartureWithDisruptions } from "../../shared/disruptions/departure-with-disruptions";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { nowUTCLuxon } from "../../shared/qtime/luxon-conversions";

const disruptionsConsideredFreshMinutes = 15;

export class Disruptions {
  private _ctx: TrainQuery | null = null;
  private _sources: DisruptionSource[] | null = null;
  private _disruptions: Disruption[] = [];
  private _lastUpdated: QUtcDateTime | null = null;

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
    this._lastUpdated = nowUTCLuxon();
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

  isStale(): boolean {
    if (this._lastUpdated == null) {
      return false;
    }

    const expiry = this._lastUpdated.add({
      m: disruptionsConsideredFreshMinutes,
    });
    return nowUTCLuxon().isAfter(expiry);
  }

  private _requireCtx(): TrainQuery {
    if (this._ctx == null) {
      throw new Error("Call init() first.");
    }
    return this._ctx;
  }
}
