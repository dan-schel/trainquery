import { StopID } from "../../shared/system/ids";
import { Departure } from "../../shared/system/timetable/departure";
import { Bucket } from "./get-departures";
import { Possibility } from "./get-possibilities";

export class FilteredBucket extends Bucket<Departure> {
  readonly departures: Departure[] = [];

  constructor(
    readonly stop: StopID,
    readonly capacity: number,
    readonly filter: string
  ) {
    super();
  }

  willAccept(_possibility: Possibility): boolean {
    // TODO: Do filtering.
    return true;
  }
  push(service: Departure): void {
    this.departures.push(service);
  }
  isFull(): boolean {
    return this.departures.length < this.capacity;
  }
}
