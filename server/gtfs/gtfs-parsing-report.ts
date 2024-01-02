import { z } from "zod";
import { requireStop } from "../../shared/system/config-utils";
import { StopID, StopIDJson } from "../../shared/system/ids";
import { TrainQuery } from "../trainquery";

export class GtfsParsingReport {
  constructor(
    readonly unsupportedGtfsStopIDs: Set<number>,
    readonly unsupportedRoutes: StopID[][],
    private _rejectedTrips: number,
    private _acceptedTrips: number,
    private _mergedTrips: number,
    private _duplicatedTrips: number,
    private _numOfSplits: number,
  ) {}

  static blank() {
    return new GtfsParsingReport(new Set(), [], 0, 0, 0, 0, 0);
  }

  static readonly json = z
    .object({
      unsupportedGtfsStopIDs: z.number().array(),
      unsupportedRoutes: StopIDJson.array().array(),
      rejectedTrips: z.number(),
      acceptedTrips: z.number(),
      mergedTrips: z.number(),
      duplicatedTrips: z.number(),
      numOfSplits: z.number(),
    })
    .transform(
      (x) =>
        new GtfsParsingReport(
          new Set(x.unsupportedGtfsStopIDs),
          x.unsupportedRoutes,
          x.rejectedTrips,
          x.acceptedTrips,
          x.mergedTrips,
          x.duplicatedTrips,
          x.numOfSplits,
        ),
    );

  toJSON(): z.input<typeof GtfsParsingReport.json> {
    return {
      unsupportedGtfsStopIDs: Array.from(this.unsupportedGtfsStopIDs.values()),
      unsupportedRoutes: this.unsupportedRoutes,
      rejectedTrips: this.rejectedTrips,
      acceptedTrips: this.acceptedTrips,
      mergedTrips: this.mergedTrips,
      duplicatedTrips: this.duplicatedTrips,
      numOfSplits: this.numOfSplits,
    };
  }

  logRejectedStop(...gtfsStopIDs: number[]) {
    for (const gtfsStopID of gtfsStopIDs) {
      this.unsupportedGtfsStopIDs.add(gtfsStopID);
    }
  }

  logRejectedRoute(route: StopID[]) {
    // Check if this route has already been added. Start from the back of the
    // array, since duplicate routes tend to occur in a row.
    for (let i = this.unsupportedRoutes.length - 1; i >= 0; i--) {
      const compare = this.unsupportedRoutes[i];
      if (route.length === compare.length) {
        let match = true;
        for (let j = 0; j < route.length; j++) {
          if (route[j] !== compare[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          return;
        }
      }
    }

    this.unsupportedRoutes.push(route);
  }

  logRejectedTrip() {
    this._rejectedTrips++;
  }
  logAcceptedTrips(acceptedTrips: number) {
    this._acceptedTrips = acceptedTrips;
  }
  logMergedTrip() {
    this._mergedTrips++;
  }
  logDuplicatedTrip() {
    this._duplicatedTrips++;
  }
  logSplit() {
    this._numOfSplits++;
  }

  get rejectedTrips() {
    return this._rejectedTrips;
  }
  get acceptedTrips() {
    return this._acceptedTrips;
  }
  get mergedTrips() {
    return this._mergedTrips;
  }
  get duplicatedTrips() {
    return this._duplicatedTrips;
  }
  get numOfSplits() {
    return this._numOfSplits;
  }

  print(ctx: TrainQuery, printer: (input: string) => void) {
    const acc = this.acceptedTrips;
    const rej = this.rejectedTrips;
    const mer = this.mergedTrips;
    const dup = this.duplicatedTrips;
    const tot = acc + rej + mer + dup;
    const accPerc = ((acc / tot) * 100).toFixed(2) + "%";
    const rejPerc = ((rej / tot) * 100).toFixed(2) + "%";
    const merPerc = ((mer / tot) * 100).toFixed(2) + "%";
    const dupPerc = ((dup / tot) * 100).toFixed(2) + "%";

    const spl = this.numOfSplits;

    printer("[GTFS PARSING REPORT]");
    printer("");
    printer(`Trips accepted: ${acc} (${accPerc})`);
    printer(`Trips merged: ${mer} (${merPerc})`);
    printer(`Trips duplicated: ${dup} (${dupPerc})`);
    printer(`Trips rejected: ${rej} (${rejPerc})`);
    printer(`Number of splits: ${spl}`);

    printer("");
    printer("Unsupported stops:");
    for (const s of this.unsupportedGtfsStopIDs.values()) {
      printer(` -  ${s}`);
    }
    if (this.unsupportedGtfsStopIDs.size === 0) {
      printer(`    None!`);
    }

    printer("");
    printer("Unsupported routes:");
    for (const r of this.unsupportedRoutes) {
      const names = r.map((s) => requireStop(ctx.getConfig(), s).name);
      printer(` -  ${names.join(" → ")}`);
    }
    if (this.unsupportedRoutes.length === 0) {
      printer(`    None!`);
    }
  }

  static merge(reports: GtfsParsingReport[]): GtfsParsingReport {
    return new GtfsParsingReport(
      new Set(
        reports
          .map((r) => Array.from(r.unsupportedGtfsStopIDs.values()))
          .flat(),
      ),
      reports.map((r) => r.unsupportedRoutes).flat(),
      reports.reduce((sum, r) => sum + r.rejectedTrips, 0),
      reports.reduce((sum, r) => sum + r.acceptedTrips, 0),
      reports.reduce((sum, r) => sum + r.mergedTrips, 0),
      reports.reduce((sum, r) => sum + r.duplicatedTrips, 0),
      reports.reduce((sum, r) => sum + r.numOfSplits, 0),
    );
  }
}
