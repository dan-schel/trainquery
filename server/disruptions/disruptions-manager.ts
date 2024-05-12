import { Disruption } from "../../shared/disruptions/disruption";
import { DepartureWithDisruptions } from "../../shared/disruptions/departure-with-disruptions";
import { Departure } from "../../shared/system/service/departure";
import { TrainQuery } from "../ctx/trainquery";
import { PtvDisruptionSource } from "./sources/ptv/ptv-disruption-source";
import { DisruptionTypeHandler } from "./type-handlers/disruption-type-handler";
import { GenericLineDisruptionHandler } from "./type-handlers/generic-line-disruption-handler";
import { GenericStopDisruptionHandler } from "./type-handlers/generic-stop-disruption-handler";
import { ProposedDisruptionSource } from "./sources/proposed-disruption-source";
import {
  ProposedDisruption,
  ProposedDisruptionID,
} from "../../shared/disruptions/proposed/proposed-disruption";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { AutoDisruptionParser } from "./sources/auto-disruption-parser";
import { PtvDisruptionParser } from "./sources/ptv/ptv-disruption-parser";

const disruptionsConsideredFreshMinutes = 15;

export class DisruptionsManager {
  private readonly _sources: ProposedDisruptionSource[];
  private readonly _parsers: AutoDisruptionParser[];
  private readonly _handlers: Map<string, DisruptionTypeHandler<Disruption>>;

  // TODO: This is a local cache of disruptions so we don't need to query the
  // database every single time.
  private readonly _proposedDisruptions: ProposedDisruption[];
  private readonly _disruptions: Disruption[];
  private _lastUpdated: QUtcDateTime | null = null;

  constructor() {
    this._handlers = new Map();
    this._sources = [];
    this._parsers = [];
    this._disruptions = [];
    this._proposedDisruptions = [];
  }

  async init(ctx: TrainQuery): Promise<void> {
    this._handlers.set("generic-stop", new GenericStopDisruptionHandler(ctx));
    this._handlers.set("generic-line", new GenericLineDisruptionHandler(ctx));

    // Add the PTV specific logic if the config uses PTV. Maybe these lists
    // should come from the constructor?
    const ptvConfig = ctx.getConfig().server.ptv;
    if (!ctx.isOffline && ptvConfig != null) {
      this._sources.push(new PtvDisruptionSource(ctx, ptvConfig));
      this._parsers.push(new PtvDisruptionParser());
    }

    this._sources.forEach((x) => x.addListener(this._handleNewDisruptions));
    await Promise.all(this._sources.map((source) => source.init()));
  }

  private _handleNewDisruptions(disruptions: ProposedDisruption[]) {
    // <TEMPORARY>
    // When we do it for real, this is where we should check these proposed
    // disruptions against the database to see if they've already been curated
    // or automatically processed, ... and so on.

    this._lastUpdated = nowUTC();

    // This is how you clear an array in Javascript. Wild.
    this._disruptions.length = 0;
    this._proposedDisruptions.length = 0;

    this._proposedDisruptions.push(...disruptions);
    for (const proposal of disruptions) {
      this._disruptions.push(...this._parseDisruption(proposal));
    }
    // </TEMPORARY>
  }

  private _parseDisruption(proposal: ProposedDisruption): Disruption[] {
    for (const parser of this._parsers) {
      const parsed = parser.process(proposal);
      if (parsed != null) {
        return parsed;
      }
    }
    return [];
  }

  attachDisruptions(departure: Departure): DepartureWithDisruptions {
    const disruptions = this._disruptions.filter((d) =>
      this._requireHandler(d).affectsService(d, departure),
    );
    return new DepartureWithDisruptions(departure, disruptions);
  }

  getProposedDisruptions(): ProposedDisruption[] {
    return this._proposedDisruptions;
  }

  getProposedDisruption(id: ProposedDisruptionID): ProposedDisruption | null {
    return this._proposedDisruptions.find((x) => x.id.equals(id)) ?? null;
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

  private _requireHandler(disruption: Disruption) {
    const handler = this._handlers.get(disruption.type);
    if (handler == null) {
      throw new Error(`No handler for disruption type "${disruption.type}".`);
    }
    return handler;
  }
}
