import { Disruption } from "../../shared/disruptions/processed/disruption";
import { ExternalDisruptionInInbox } from "../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../shared/disruptions/external/rejected-external-disruption";
import { TrainQueryDB } from "../ctx/trainquery-db";
import { Transaction } from "./transaction";
import { DisruptionID, ExternalDisruptionID } from "../../shared/system/ids";
import { Collection, Document } from "mongodb";

export type DisruptionTransactions = {
  disruptions: Transaction<Disruption, DisruptionID>;
  inbox: Transaction<ExternalDisruptionInInbox, ExternalDisruptionID>;
  rejected: Transaction<RejectedExternalDisruption, ExternalDisruptionID>;
};

export interface DisruptionDatabase {
  getDisruptions(): Promise<Disruption[]>;
  getInbox(): Promise<ExternalDisruptionInInbox[]>;
  getRejected(): Promise<RejectedExternalDisruption[]>;

  onProcessedIncoming(transactions: DisruptionTransactions): Promise<void>;
}

export class InMemoryDisruptionDatabase implements DisruptionDatabase {
  private readonly _disruptions: Disruption[] = [];
  private readonly _inbox: ExternalDisruptionInInbox[] = [];
  private readonly _rejected: RejectedExternalDisruption[] = [];

  async getDisruptions(): Promise<Disruption[]> {
    return this._disruptions;
  }
  async getInbox(): Promise<ExternalDisruptionInInbox[]> {
    return this._inbox;
  }
  async getRejected(): Promise<RejectedExternalDisruption[]> {
    return this._rejected;
  }

  async onProcessedIncoming(transactions: DisruptionTransactions) {
    this._disruptions.splice(0, this._disruptions.length);
    this._disruptions.push(...transactions.disruptions.getValues());

    this._inbox.splice(0, this._disruptions.length);
    this._inbox.push(...transactions.inbox.getValues());

    this._rejected.splice(0, this._disruptions.length);
    this._rejected.push(...transactions.rejected.getValues());
  }
}

export class MongoDisruptionDatabase implements DisruptionDatabase {
  constructor(private readonly _db: TrainQueryDB) {}

  async getDisruptions(): Promise<Disruption[]> {
    const json = await this._db.dbs.disruptions.find().toArray();
    return Disruption.json.array().parse(json);
  }
  async getInbox(): Promise<ExternalDisruptionInInbox[]> {
    const json = await this._db.dbs.disruptionsInInbox.find().toArray();
    return ExternalDisruptionInInbox.json.array().parse(json);
  }
  async getRejected(): Promise<RejectedExternalDisruption[]> {
    const json = await this._db.dbs.disruptionsRejected.find().toArray();
    return RejectedExternalDisruption.json.array().parse(json);
  }

  async onProcessedIncoming(
    transactions: DisruptionTransactions,
  ): Promise<void> {
    // TODO: This is all done in series. It's probably fine since you wouldn't
    // expect the transactions to have many changes (unless the external API)
    // has a ton of new disruptions! Maybe we should do it in parallel though?
    // Does it even make a difference to how MongoDB works? Dunno.
    await this._applyTransaction(
      transactions.disruptions,
      this._db.dbs.disruptions,
    );
    await this._applyTransaction(
      transactions.inbox,
      this._db.dbs.disruptionsInInbox,
    );
    await this._applyTransaction(
      transactions.rejected,
      this._db.dbs.disruptionsRejected,
    );
  }

  private async _applyTransaction<
    A extends { id: unknown; toJSON: () => object },
    B extends string | number,
  >(transaction: Transaction<A, B>, table: Collection<Document>) {
    // TODO: See comment about "done in series" above.
    const actions = transaction.getActions();
    for (const d of actions.add) {
      await table.insertOne(d.toJSON());
    }
    for (const d of actions.update) {
      await table.replaceOne({ id: d.id }, d);
    }
    for (const d of actions.delete) {
      await table.deleteOne({ id: d });
    }
  }
}
