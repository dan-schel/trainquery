import { Collection, MongoClient, Document } from "mongodb";
import { GtfsData } from "./gtfs/gtfs-data";

type DBs = {
  gtfs: {
    metadata: Collection<Document>;
    trips: Collection<Document>;
    calendars: Collection<Document>;
  };
};

export class TrainQueryDB {
  private _client: MongoClient | null;
  private _dbs: DBs | null;

  constructor(
    private readonly _domain: string,
    private readonly _username: string,
    private readonly _password: string
  ) {
    this._client = null;
    this._dbs = null;
  }

  async init() {
    const username = encodeURIComponent(this._username);
    const password = encodeURIComponent(this._password);
    const url = `mongodb://${username}:${password}@${this._domain}:27017/?authMechanism=DEFAULT`;

    this._client = new MongoClient(url);
    await this._client.connect();

    const gtfsDb = this._client.db("trainquery-gtfs-v1");
    this._dbs = {
      gtfs: {
        metadata: gtfsDb.collection("metadata"),
        trips: gtfsDb.collection("trips"),
        calendars: gtfsDb.collection("calendars"),
      },
    };
  }

  async fetchGtfs(): Promise<GtfsData | null> {
    // TODO: Do something :)
    return null;
  }

  async writeGtfs(gtfsData: GtfsData) {
    await this.dbs.gtfs.metadata.deleteMany();
    await this.dbs.gtfs.calendars.deleteMany();
    await this.dbs.gtfs.trips.deleteMany();

    await this.dbs.gtfs.metadata.insertOne(gtfsData.metadataToJSON());
    await this.dbs.gtfs.calendars.insertMany(
      gtfsData.calendars.map((c) => c.toJSON())
    );
    await this.dbs.gtfs.trips.insertMany(gtfsData.trips.map((t) => t.toJSON()));
  }

  private _requireClient(): MongoClient {
    if (this._client == null) {
      throw new Error("Client not initialized. Did you forget to call init()?");
    }
    return this._client;
  }
  get dbs(): DBs {
    if (this._dbs == null) {
      throw new Error(
        "Database references not initialized. Did you forget to call init()?"
      );
    }
    return this._dbs;
  }
}
