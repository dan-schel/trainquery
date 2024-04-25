import {
  Disruption,
  RawDisruption,
} from "../../shared/disruptions-v2/disruption";
import { DepartureWithDisruptions } from "../../shared/disruptions-v2/departure-with-disruptions";
import { Departure } from "../../shared/system/service/departure";
import { TrainQuery } from "../ctx/trainquery";
import { PtvDisruptionSource } from "./sources/ptv/ptv-disruption-source";
import { RawDisruptionSource } from "./sources/raw-disruption-source";
import { DisruptionTypeHandler } from "./type-handlers/disruption-type-handler";
import { GenericLineDisruptionHandler } from "./type-handlers/generic-line-disruption-handler";
import { GenericStopDisruptionHandler } from "./type-handlers/generic-stop-disruption-handler";

export class DisruptionsManager {
  private readonly _sources: RawDisruptionSource[];
  private readonly _handlers: Map<
    string,
    DisruptionTypeHandler<Disruption<string>>
  >;

  // TODO: This is a local cache of disruptions so we don't need to query the
  // database every single time.
  private readonly _disruptions: Disruption<string>[];

  constructor(private readonly _ctx: TrainQuery) {
    this._handlers = new Map();
    this._sources = [];
    this._disruptions = [];
  }

  async init(): Promise<void> {
    this._handlers.set(
      "generic-stop",
      new GenericStopDisruptionHandler(this._ctx),
    );
    this._handlers.set(
      "generic-line",
      new GenericLineDisruptionHandler(this._ctx),
    );

    const ptvConfig = this._ctx.getConfig().server.ptv;
    if (!this._ctx.isOffline && ptvConfig != null) {
      this._sources.push(
        new PtvDisruptionSource(this._ctx, ptvConfig, (d) =>
          this._handleNewDisruptions(d),
        ),
      );
    }

    await Promise.all(this._sources.map((source) => source.init()));
  }

  private _handleNewDisruptions = (_disruptions: RawDisruption[]) => {
    throw new Error("Method not implemented.");
  };

  determineDisruptions(departure: Departure): DepartureWithDisruptions {
    const ctx = this._ctx;

    const disruptions = this._disruptions.filter((d) =>
      this._requireHandler(d).affectsService(d, departure),
    );
    return new DepartureWithDisruptions(
      departure,
      disruptions.map((d) => d.toJSON(ctx)),
    );
  }

  private _requireHandler(disruption: Disruption<string>) {
    const handler = this._handlers.get(disruption.type);
    if (handler == null || !handler.handles(disruption)) {
      throw new Error(`No handler for disruption type "${disruption.type}".`);
    }
    return handler;
  }
}
