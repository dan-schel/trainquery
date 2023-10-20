import { MongoClient } from "mongodb";
import { GtfsData } from "./gtfs/gtfs-data";

export class TrainQueryDB {
  private _client: MongoClient | null;

  constructor(
    private readonly _domain: string,
    private readonly _username: string,
    private readonly _password: string
  ) {
    this._client = null;
  }

  async init() {
    const username = encodeURIComponent(this._username);
    const password = encodeURIComponent(this._password);
    const url = `mongodb://${username}:${password}@${this._domain}:27017/?authMechanism=DEFAULT`;

    this._client = new MongoClient(url);
    this._client.connect();
  }

  async fetchGtfs(): Promise<GtfsData | null> {
    // TODO: Do something :)
    return null;
  }

  async writeGtfs(gtfsData: GtfsData) {
    // TODO: Actually write the data! :)
    const client = this._requireClient();
    client.db("trainquery-gtfs-v1").collection("metadata").insertOne({
      hello: "world"
    });
  }

  private _requireClient(): MongoClient {
    if (this._client == null) {
      throw new Error("Client not initialized. Did you forget to call init()?");
    }
    return this._client;
  }
}
