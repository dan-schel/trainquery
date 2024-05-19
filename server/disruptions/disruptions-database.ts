import { Disruption } from "../../shared/disruptions/processed/disruption";
import { ExternalDisruptionInInbox } from "../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../shared/disruptions/external/rejected-external-disruption";
import { TrainQueryDB } from "../ctx/trainquery-db";

export interface DisruptionDatabase {
  getDisruptions(): Promise<Disruption[]>;
  getInbox(): Promise<ExternalDisruptionInInbox[]>;
  getRejected(): Promise<RejectedExternalDisruption[]>;

  // onNewProposal(actions: RequiredAction): Promise<void>;
}

export class InMemoryDisruptionDatabase implements DisruptionDatabase {
  readonly _disruptions: Disruption[] = [];
  readonly _inbox: ExternalDisruptionInInbox[] = [];
  readonly _rejected: RejectedExternalDisruption[] = [];

  async getDisruptions(): Promise<Disruption[]> {
    return this._disruptions;
  }
  async getInbox(): Promise<ExternalDisruptionInInbox[]> {
    return this._inbox;
  }
  async getRejected(): Promise<RejectedExternalDisruption[]> {
    return this._rejected;
  }

  // async onNewProposal(actions: RequiredAction): Promise<void> {
  //   actions.addToInbox.forEach((p) => {
  //     this._inbox.push(p);
  //   });
  //   actions.removeFromInbox.forEach((p) => {
  //     const idx = this._inbox.findIndex((x) => x.id.equals(p));
  //     if (idx !== -1) {
  //       this._inbox.splice(idx, 1);
  //     }
  //   });
  //   actions.removeFromHandled.forEach((p) => {
  //     const idx = this._handled.findIndex((x) => x.id.equals(p));
  //     if (idx !== -1) {
  //       this._handled.splice(idx, 1);
  //     }
  //   });
  //   actions.addDisruptions.forEach((d) => {
  //     this._disruptions.push(d);
  //   });
  //   actions.deleteDisruptions.forEach((d) => {
  //     const idx = this._disruptions.findIndex((y) => y.id === d);
  //     if (idx !== -1) {
  //       this._disruptions.splice(idx, 1);
  //     }
  //   });
  // }
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

  // async onNewProposal(actions: RequiredAction): Promise<void> {
  //   const promises: Promise<any>[] = [];

  //   promises.push(
  //     ...actions.addToInbox.map((p) =>
  //       this._db.dbs.disruptionInbox.insertOne(proposedDisruptionToJson(p)),
  //     ),
  //   );
  //   promises.push(
  //     ...actions.removeFromInbox.map((p) => {
  //       return this._db.dbs.disruptionInbox.deleteOne({ id: p.toJSON() });
  //     }),
  //   );
  //   promises.push(
  //     ...actions.removeFromHandled.map((p) => {
  //       return this._db.dbs.disruptionsHandled.deleteOne({ id: p.toJSON() });
  //     }),
  //   );
  //   promises.push(
  //     ...actions.addDisruptions.map((d) => {
  //       return this._db.dbs.disruptions.insertOne(disruptionToJson(d));
  //     }),
  //   );
  //   promises.push(
  //     ...actions.deleteDisruptions.map((d) => {
  //       return this._db.dbs.disruptions.deleteOne({ id: d });
  //     }),
  //   );

  //   await Promise.all(promises);
  // }
}
