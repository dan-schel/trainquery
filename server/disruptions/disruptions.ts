import { Departure } from "../../shared/system/service/departure";
import { TrainQuery } from "../ctx/trainquery";
import { Disruption } from "./disruption";
import { DisruptionSource } from "./source/disruption-source";
import { PtvDisruptionSource } from "./source/ptv/ptv-disruption-source";
import { DepartureWithDisruptions } from "../../shared/disruptions/departure-with-disruptions";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { RawDisruption } from "./raw-disruption";
import { DisruptionSourceID } from "./raw-disruption-id-components";

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

  getAll(): Disruption[] {
    return this._disruptions;
  }
  getRaw(): RawDisruption[] {
    return this._disruptions.filter(
      (x): x is RawDisruption => x instanceof RawDisruption,
    );
  }

  handleNewDisruptions(disruptions: Disruption[]) {
    this._disruptions = disruptions;
    this._lastUpdated = nowUTC();
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
      return true;
    }

    const expiry = this._lastUpdated.add({
      m: disruptionsConsideredFreshMinutes,
    });
    return nowUTC().isAfter(expiry);
  }

  getRawDisruption(
    source: DisruptionSourceID,
    id: string,
  ): RawDisruption | null {
    return (
      this.getRaw().find((x) => x.source === source && x.id === id) ?? null
    );
  }

  private _requireCtx(): TrainQuery {
    if (this._ctx == null) {
      throw new Error("Call init() first.");
    }
    return this._ctx;
  }
}
