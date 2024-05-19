import { DepartureWithDisruptions } from "../../shared/disruptions/departure-with-disruptions";
import { Departure } from "../../shared/system/service/departure";
import { TrainQuery } from "../ctx/trainquery";
import { PtvDisruptionProvider } from "./provider/ptv/ptv-disruption-source";
import { DisruptionTypeHandler } from "./type-handlers/disruption-type-handler";
import { GenericLineDisruptionHandler } from "./type-handlers/generic-line-disruption-handler";
import { GenericStopDisruptionHandler } from "./type-handlers/generic-stop-disruption-handler";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { AutoDisruptionParser } from "./provider/auto-disruption-parser";
import { PtvDisruptionParser } from "./provider/ptv/ptv-disruption-parser";
import { DisruptionProvider } from "./provider/disruption-provider";
import { DisruptionData } from "../../shared/disruptions/processed/disruption-data";
import { ExternalDisruption } from "../../shared/disruptions/external/external-disruption";
import { Disruption } from "../../shared/disruptions/processed/disruption";
import { ExternalDisruptionData } from "../../shared/disruptions/external/external-disruption-data";
import { uuid } from "@dan-schel/js-utils";
import { toDisruptionID } from "../../shared/system/ids";
import { GenericStopDisruptionData } from "../../shared/disruptions/processed/types/generic-stop";
import { GenericLineDisruptionData } from "../../shared/disruptions/processed/types/generic-line";
import { ExternalDisruptionID } from "../../shared/disruptions/external/external-disruption-id";

const disruptionsConsideredFreshMinutes = 15;

export class DisruptionsManager {
  private readonly _providers: DisruptionProvider[];
  private readonly _parsers: AutoDisruptionParser[];
  private readonly _handlers: Map<
    string,
    DisruptionTypeHandler<DisruptionData>
  >;

  // TODO: This is a local cache of disruptions so we don't need to query the
  // database every single time.
  private readonly _externalDisruptions: ExternalDisruption[];
  private readonly _disruptions: Disruption[];
  private _lastUpdated: QUtcDateTime | null = null;

  constructor() {
    this._handlers = new Map();
    this._providers = [];
    this._parsers = [];
    this._disruptions = [];
    this._externalDisruptions = [];
  }

  async init(ctx: TrainQuery): Promise<void> {
    this._handlers.set(
      GenericStopDisruptionData.type,
      new GenericStopDisruptionHandler(ctx),
    );
    this._handlers.set(
      GenericLineDisruptionData.type,
      new GenericLineDisruptionHandler(ctx),
    );

    // Add the PTV specific logic if the config uses PTV. Maybe these lists
    // should come from the constructor?
    const ptvConfig = ctx.getConfig().server.ptv;
    if (!ctx.isOffline && ptvConfig != null) {
      this._providers.push(new PtvDisruptionProvider(ctx, ptvConfig));
      this._parsers.push(new PtvDisruptionParser());
    }

    this._providers.forEach((x) =>
      x.addListener((y) => this._handleNewDisruptions(y)),
    );
    await Promise.all(this._providers.map((source) => source.init()));
  }

  private _handleNewDisruptions(disruptions: ExternalDisruptionData[]) {
    // <TEMPORARY>
    // When we do it for real, this is where we should check these proposed
    // disruptions against the database to see if they've already been curated
    // or automatically processed, ... and so on.

    this._lastUpdated = nowUTC();

    // This is how you clear an array in Javascript. Wild.
    this._disruptions.length = 0;
    this._externalDisruptions.length = 0;

    const newDisruptions = disruptions.map((x) => new ExternalDisruption(x));

    this._externalDisruptions.push(...newDisruptions);
    for (const disruption of newDisruptions) {
      const processed = this._parseFromExternal(disruption.data).map(
        (x) =>
          new Disruption(
            toDisruptionID(uuid()),
            x,
            "provisional",
            [disruption],
            null,
          ),
      );
      this._disruptions.push(...processed);
    }
    // </TEMPORARY>
  }

  private _parseFromExternal(input: ExternalDisruptionData): DisruptionData[] {
    for (const parser of this._parsers) {
      const parsed = parser.process(input);
      if (parsed != null) {
        return parsed;
      }
    }
    return [];
  }

  attachDisruptions(departure: Departure): DepartureWithDisruptions {
    const disruptions = this._disruptions.filter((d) =>
      this._requireHandler(d).affectsService(d.data, departure),
    );
    return new DepartureWithDisruptions(departure, disruptions);
  }

  getExternalDisruptions(): ExternalDisruption[] {
    return this._externalDisruptions;
  }

  getExternalDisruption(id: ExternalDisruptionID): ExternalDisruption | null {
    return this._externalDisruptions.find((x) => x.id.equals(id)) ?? null;
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
