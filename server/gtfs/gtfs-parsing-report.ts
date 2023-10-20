import { StopID } from "../../shared/system/ids";

export class GtfsParsingReport {
  constructor(
    readonly unsupportedGtfsStopIDs: Set<number>,
    readonly unsupportedRoutes: StopID[][],
    private _rejectedTrips: number,
    private _acceptedTrips: number
  ) {}

  static blank() {
    return new GtfsParsingReport(new Set(), [], 0, 0);
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
      if (route.length == compare.length) {
        let match = true;
        for (let j = 0; j < route.length; j++) {
          if (route[j] != compare[j]) {
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
  logAcceptedTrip() {
    this._acceptedTrips++;
  }

  get rejectedTrips() {
    return this._rejectedTrips;
  }
  get acceptedTrips() {
    return this._acceptedTrips;
  }

  static merge(reports: GtfsParsingReport[]): GtfsParsingReport {
    return new GtfsParsingReport(
      new Set(...reports.map((r) => r.unsupportedGtfsStopIDs.values()).flat()),
      reports.map((r) => r.unsupportedRoutes).flat(),
      reports.reduce((sum, r) => sum + r.rejectedTrips, 0),
      reports.reduce((sum, r) => sum + r.acceptedTrips, 0)
    );
  }
}
