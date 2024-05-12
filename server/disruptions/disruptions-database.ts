import { Disruption } from "../../shared/disruptions/disruption";
import {
  DisruptionJson,
  disruptionToJson,
} from "../../shared/disruptions/disruption-json";
import { ProposedDisruption } from "../../shared/disruptions/proposed/proposed-disruption";
import {
  ProposedDisruptionJson,
  proposedDisruptionToJson,
} from "../../shared/disruptions/proposed/proposed-disruption-json";
import { TrainQueryDB } from "../ctx/trainquery-db";
import { RequiredAction } from "./process-new-proposal";

export interface DisruptionDatabase {
  getDisruptions(): Promise<Disruption[]>;
  getProposalsInInbox(): Promise<ProposedDisruption[]>;
  getHandledProposals(): Promise<ProposedDisruption[]>;

  onNewProposal(actions: RequiredAction): Promise<void>;
}

export class InMemoryDisruptionDatabase implements DisruptionDatabase {
  readonly _disruptions: Disruption[] = [];
  readonly _inbox: ProposedDisruption[] = [];
  readonly _handled: ProposedDisruption[] = [];

  async getDisruptions(): Promise<Disruption[]> {
    return this._disruptions;
  }
  async getProposalsInInbox(): Promise<ProposedDisruption[]> {
    return this._inbox;
  }
  async getHandledProposals(): Promise<ProposedDisruption[]> {
    return this._handled;
  }

  async onNewProposal(actions: RequiredAction): Promise<void> {
    actions.addToInbox.forEach((p) => {
      this._inbox.push(p);
    });
    actions.removeFromHandled.forEach((p) => {
      const idx = this._handled.findIndex((x) => x.id.equals(p));
      if (idx !== -1) {
        this._handled.splice(idx, 1);
      }
    });
    actions.addDisruptions.forEach((d) => {
      this._disruptions.push(d);
    });
    actions.deleteDisruptions.forEach((d) => {
      const idx = this._disruptions.findIndex((y) => y.id === d);
      if (idx !== -1) {
        this._disruptions.splice(idx, 1);
      }
    });
  }
}

export class MongoDisruptionDatabase implements DisruptionDatabase {
  constructor(private readonly _db: TrainQueryDB) {}

  async getDisruptions(): Promise<Disruption[]> {
    const json = await this._db.dbs.disruptions.find().toArray();
    return DisruptionJson.array().parse(json);
  }
  async getProposalsInInbox(): Promise<ProposedDisruption[]> {
    const json = await this._db.dbs.disruptionInbox.find().toArray();
    return ProposedDisruptionJson.array().parse(json);
  }
  async getHandledProposals(): Promise<ProposedDisruption[]> {
    const json = await this._db.dbs.disruptionsHandled.find().toArray();
    return ProposedDisruptionJson.array().parse(json);
  }

  async onNewProposal(actions: RequiredAction): Promise<void> {
    const promises: Promise<any>[] = [];

    promises.push(
      ...actions.addToInbox.map((p) =>
        this._db.dbs.disruptionInbox.insertOne(proposedDisruptionToJson(p)),
      ),
    );
    promises.push(
      ...actions.removeFromHandled.map((p) => {
        return this._db.dbs.disruptionsHandled.deleteOne({ id: p.toJSON() });
      }),
    );
    promises.push(
      ...actions.addDisruptions.map((d) => {
        return this._db.dbs.disruptions.insertOne(disruptionToJson(d));
      }),
    );
    promises.push(
      ...actions.deleteDisruptions.map((d) => {
        return this._db.dbs.disruptions.deleteOne({ id: d });
      }),
    );

    await Promise.all(promises);
  }
}
