import { Collection, MongoClient, Document } from "mongodb";
import { GtfsData } from "../gtfs/data/gtfs-data";
import { GtfsCalendar } from "../gtfs/data/gtfs-calendar";
import { GtfsTrip } from "../gtfs/data/gtfs-trip";
import { Session } from "../../shared/admin/session";
import { nowUTC } from "../../shared/qtime/luxon-conversions";
import { AdminLog, AdminLogWindow } from "../../shared/admin/logs";

type DBs = {
  gtfsMetadata: Collection<Document>;
  gtfsTrips: Collection<Document>;
  gtfsCalendars: Collection<Document>;
  adminAuth: Collection<Document>;
  logs: Collection<Document>;
  disruptions: Collection<Document>;
  disruptionsInInbox: Collection<Document>;
  disruptionsRejected: Collection<Document>;
};

export class TrainQueryDB {
  private _client: MongoClient | null;
  private _dbs: DBs | null;

  constructor(private readonly _connectionStr: string) {
    this._client = null;
    this._dbs = null;
  }

  async init() {
    this._client = new MongoClient(this._connectionStr);
    await this._client.connect();

    const db = this._client.db("trainquery");
    db.createCollection("gtfsMetadataV1");
    db.createCollection("gtfsTripsV1");
    db.createCollection("gtfsCalendarsV1");
    db.createCollection("adminAuthV1");
    db.createCollection("logsV2");
    db.createCollection("disruptionsV1");
    db.createCollection("disruptionsInInboxV1");
    db.createCollection("disruptionsRejectedV1");

    this._dbs = {
      gtfsMetadata: db.collection("gtfsMetadataV1"),
      gtfsTrips: db.collection("gtfsTripsV1"),
      gtfsCalendars: db.collection("gtfsCalendarsV1"),
      adminAuth: db.collection("adminAuthV1"),
      logs: db.collection("logsV2"),
      disruptions: db.collection("disruptionsV1"),
      disruptionsInInbox: db.collection("disruptionsInInboxV1"),
      disruptionsRejected: db.collection("disruptionsRejectedV1"),
    };

    // TODO: Might want to find a better place for this?
    // It seems as though MongoDB is smart enough not to duplicate the index,
    // even though this is being called every time the server starts.
    this._dbs.logs.createIndex({ instance: 1, sequence: 1 });
  }

  get dbs(): DBs {
    if (this._dbs == null) {
      throw new Error(
        "Database references not initialized. Did you forget to call init()?",
      );
    }
    return this._dbs;
  }

  /** Fetches the GTFS schedule data (not realtime) from the database. */
  async fetchGtfs(configHash: string): Promise<GtfsData | null> {
    const metadataDoc = await this.dbs.gtfsMetadata.findOne();
    if (metadataDoc == null) {
      return null;
    }
    const metadata = GtfsData.metadataJson.parse(metadataDoc);
    if (metadata.configHash !== configHash) {
      return null;
    }

    const calendarDocs = await this.dbs.gtfsCalendars.find().toArray();
    const tripDocs = await this.dbs.gtfsTrips.find().toArray();
    const calendars = calendarDocs.map((c) => GtfsCalendar.json.parse(c));

    // Intentionally parses every trip as a GtfsTrip, not a GtfsRealtimeTrip,
    // because realtime data is not - and should not - be saved to the database.
    const trips = tripDocs.map((t) => GtfsTrip.json.parse(t));

    return new GtfsData(
      calendars,
      trips,
      metadata.configHash,
      metadata.parsingReport,
      metadata.age,
    );
  }

  /**
   * Writes the GTFS schedule data (excluding realtime enchancements) to the
   * database.
   */
  async writeGtfs(gtfsData: GtfsData) {
    await this.dbs.gtfsMetadata.deleteMany();
    await this.dbs.gtfsCalendars.deleteMany();
    await this.dbs.gtfsTrips.deleteMany();

    await this.dbs.gtfsMetadata.insertOne(gtfsData.metadataToJSON());
    await this.dbs.gtfsCalendars.insertMany(
      gtfsData.calendars.map((c) => c.toJSON()),
    );

    // Intentionally uses the base GtfsTrip type, not GtfsRealtimeTrip, because
    // we do not wish to write the realtime data to the database.
    await this.dbs.gtfsTrips.insertMany(gtfsData.trips.map((t) => t.toJSON()));
  }

  /** Retrieve all admin auth tokens from the database. */
  async fetchAdminAuthSession(token: string): Promise<Session | null> {
    const doc = await this.dbs.adminAuth.findOne({ token });
    if (doc == null) {
      return doc;
    }
    return Session.mongo.parse(doc);
  }

  /** Writes a session to the database. */
  async writeAdminAuthSession(session: Session) {
    await this.dbs.adminAuth.insertOne(session.toMongo());
  }

  /** Deletes a session from the database. */
  async deleteAdminAuthSession(token: string) {
    await this.dbs.adminAuth.deleteOne({ token });
  }

  /** Deletes every expired session from the database. */
  async cleanupExpiredAdminAuthSessions() {
    await this.dbs.adminAuth.deleteMany({
      expiry: { $lt: nowUTC().toMongo() },
    });
  }

  /** Inserts a collection of logs into the database. */
  async writeLogs(logs: AdminLog[]) {
    // Use toMongo() to ensure the dates are not stored as strings, and the
    // cleanupOldLogs function works correctly.
    await this.dbs.logs.insertMany(logs.map((l) => l.toMongo()));
  }

  /** Deletes logs that are over `daysOld` days old. */
  async cleanupOldLogs(daysOld: number) {
    await this.dbs.logs.deleteMany({
      timestamp: { $lt: nowUTC().add({ d: -daysOld }).toMongo() },
    });
  }

  /**
   * Gets `count` number of logs from TrainQuery instance `instance` before log
   * sequence number `beforeSeqence`.
   */
  async fetchLogs(instance: string, beforeSequence: number, count: number) {
    const docs = await this.dbs.logs
      .find({
        instance,
        sequence: { $gte: beforeSequence - count, $lt: beforeSequence },
      })
      .toArray();
    const logs = docs.map((d) => AdminLog.mongo.parse(d));
    return new AdminLogWindow(instance, logs, { beforeSequence, count });
  }
}
