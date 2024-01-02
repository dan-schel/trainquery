import { StopID } from "../../shared/system/ids";
import { DepartureFilter } from "../../shared/system/timetable/departure-filter";
import { AllFilteringData, getAllFilteringData } from "../timetable/filtering";
import { Bucket } from "../timetable/get-departures";
import { guessPlatform } from "../timetable/guess-platform";
import { TrainQuery } from "../trainquery";
import { GtfsPossibility } from "./gtfs-departure-source";
import { TimetablePossibility } from "./timetable-departure-source";

export class FilteredBucket<B> extends Bucket<
  TimetablePossibility | GtfsPossibility,
  B
> {
  readonly items: B[] = [];

  constructor(
    private readonly _ctx: TrainQuery,
    readonly stop: StopID,
    readonly capacity: number,
    readonly filter: DepartureFilter,
  ) {
    super();
  }

  willAccept(possibility: TimetablePossibility | GtfsPossibility): boolean {
    const data = getAllFilteringData(this._ctx, possibility);
    return filterAccepts(this._ctx, this.filter, this.stop, data);
  }
  push(item: B): void {
    this.items.push(item);
  }
  isFull(): boolean {
    return this.items.length >= this.capacity;
  }
}

export class PassthroughBucket<B> extends Bucket<any, B> {
  readonly items: B[] = [];

  constructor(
    readonly stop: StopID,
    readonly capacity: number,
  ) {
    super();
  }

  willAccept(_possibility: any): boolean {
    return true;
  }
  push(item: B): void {
    this.items.push(item);
  }
  isFull(): boolean {
    return this.items.length >= this.capacity;
  }
}

function filterAccepts(
  ctx: TrainQuery,
  filter: DepartureFilter,
  stop: StopID,
  data: AllFilteringData,
) {
  // Filter by line.
  if (filter.lines != null && !filter.lines.some((l) => l === data.line.id)) {
    return false;
  }

  // Filter by direction.
  if (
    filter.directions != null &&
    !filter.directions.some((d) => d === data.direction)
  ) {
    return false;
  }

  // Filter by platform.
  const platform = guessPlatform(ctx, stop, data);
  if (
    filter.platforms != null &&
    (platform == null || !filter.platforms.some((p) => p === platform.id))
  ) {
    return false;
  }

  // Filter by service type.
  if (
    filter.serviceTypes != null &&
    !filter.serviceTypes.some((s) => s === data.serviceType)
  ) {
    return false;
  }

  // Filter arrivals.
  if (!filter.arrivals && data.isArrival) {
    return false;
  }

  // Filter set-down-only services.
  if (!filter.setDownOnly && !data.picksUp) {
    return false;
  }

  return true;
}
