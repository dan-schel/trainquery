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
import { nonNull } from "@dan-schel/js-utils";
import { ExternalDisruptionID } from "../../shared/system/ids";
import { GenericStopDisruptionData } from "../../shared/disruptions/processed/types/generic-stop";
import { GenericLineDisruptionData } from "../../shared/disruptions/processed/types/generic-line";
import { processIncomingDisruptions } from "./process-incoming-disruptions";
import {
  DisruptionDatabase,
  DisruptionTransactions,
  InMemoryDisruptionDatabase,
  MongoDisruptionDatabase,
} from "./disruptions-database";
import { Transaction } from "./transaction";

const disruptionsConsideredFreshMinutes = 15;

export class DisruptionsManager {
  private readonly _providers: DisruptionProvider[];
  private readonly _parsers: AutoDisruptionParser[];
  private readonly _handlers: Map<
    string,
    DisruptionTypeHandler<DisruptionData>
  >;

  private _database: DisruptionDatabase | null;
  private _lastUpdated: QUtcDateTime | null;

  constructor() {
    this._handlers = new Map();
    this._providers = [];
    this._parsers = [];

    this._database = null;
    this._lastUpdated = null;
  }

  async init(ctx: TrainQuery): Promise<void> {
    this._database =
      ctx.database != null
        ? new MongoDisruptionDatabase(ctx.database)
        : new InMemoryDisruptionDatabase();

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

    this._providers.forEach((provider) =>
      provider.addListener((_x) => this._handleNewDisruptions(ctx)),
    );
    await Promise.all(this._providers.map((source) => source.init()));
  }

  private async _handleNewDisruptions(ctx: TrainQuery) {
    const providerDisruptions = this._providers.map((x) => x.getDisruptions());
    const availableProviderDisruptions = providerDisruptions.filter(nonNull);
    const numUnavailable =
      providerDisruptions.length - availableProviderDisruptions.length;

    if (numUnavailable > 0) {
      ctx.logger.logDisruptionProvidersNotReady(numUnavailable);
      return;
    }

    const incoming = availableProviderDisruptions
      .flat()
      .map((x) => new ExternalDisruption(x));
    const transactions =
      await this._fetchDisruptionsInboxAndRejectedTransactions();

    processIncomingDisruptions({
      incomingDisruptions: incoming,
      parsers: this._parsers,
      ...transactions,
    });

    ctx.logger.logDisruptionTransactions(transactions);
    await this._requireDatabase().onProcessedIncoming(transactions);

    this._lastUpdated = nowUTC();
  }

  private async _fetchDisruptions() {
    return await this._requireDatabase().getDisruptions();
  }
  private async _fetchDisruptionsInboxAndRejected() {
    const disruptions = await this._fetchDisruptions();
    const inbox = await this._requireDatabase().getInbox();
    const rejected = await this._requireDatabase().getRejected();
    return { disruptions, inbox, rejected };
  }
  private async _fetchDisruptionsInboxAndRejectedTransactions(): Promise<DisruptionTransactions> {
    const data = await this._fetchDisruptionsInboxAndRejected();
    return {
      disruptions: new Transaction(data.disruptions, (x) => x.id),
      inbox: new Transaction(data.inbox, (x) => x.id),
      rejected: new Transaction(data.rejected, (x) => x.id),
    };
  }

  private _parseFromExternal(input: ExternalDisruptionData): DisruptionData[] {
    for (const parser of this._parsers) {
      const parsed = parser.process(input);
      if (parsed != null) {
        return parsed.disruptions;
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
    return this._externalDisruptions.find((x) => x.id === id) ?? null;
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

  private _requireDatabase() {
    const database = this._database;
    if (database == null) {
      throw new Error("No database available. Call init() first.");
    }
    return database;
  }
}
