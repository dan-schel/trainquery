import { Collection, MongoClient, Document } from "mongodb";
import { GtfsCalendar, GtfsData, GtfsTrip } from "./gtfs/gtfs-data";

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
    private readonly _password: string,
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

  get dbs(): DBs {
    if (this._dbs == null) {
      throw new Error(
        "Database references not initialized. Did you forget to call init()?",
      );
    }
    return this._dbs;
  }

  async fetchGtfs(configHash: string): Promise<GtfsData | null> {
    const metadataDoc = await this.dbs.gtfs.metadata.findOne();
    if (metadataDoc == null) {
      return null;
    }
    const metadata = GtfsData.metadataJson.parse(metadataDoc);
    if (metadata.configHash !== configHash) {
      return null;
    }

    const calendarDocs = await this.dbs.gtfs.calendars.find().toArray();
    const tripDocs = await this.dbs.gtfs.trips.find().toArray();
    const calendars = GtfsCalendar.json.array().parse(calendarDocs);
    const trips = GtfsTrip.json.array().parse(tripDocs);
    return new GtfsData(
      calendars,
      trips,
      metadata.configHash,
      metadata.parsingReport,
      metadata.age,
    );
  }

  async writeGtfs(gtfsData: GtfsData) {
    await this.dbs.gtfs.metadata.deleteMany();
    await this.dbs.gtfs.calendars.deleteMany();
    await this.dbs.gtfs.trips.deleteMany();

    await this.dbs.gtfs.metadata.insertOne(gtfsData.metadataToJSON());
    await this.dbs.gtfs.calendars.insertMany(
      gtfsData.calendars.map((c) => c.toJSON()),
    );
    await this.dbs.gtfs.trips.insertMany(gtfsData.trips.map((t) => t.toJSON()));
  }
}
