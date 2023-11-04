import { requireLine } from "../../shared/system/config-utils";
import { StopID } from "../../shared/system/ids";
import { DepartureFilter } from "../../shared/system/timetable/departure-filter";
import { TimetablePossibility } from "../departures/timetable-departure-source";
import { TrainQuery } from "../trainquery";
import { Bucket } from "./get-departures";
import { guessPlatformOfPossibility } from "./guess-platform";

export class FilteredBucket<B> extends Bucket<TimetablePossibility, B> {
  readonly items: B[] = [];

  constructor(
    private readonly _ctx: TrainQuery,
    readonly stop: StopID,
    readonly capacity: number,
    readonly filter: DepartureFilter,
  ) {
    super();
  }

  willAccept(possibility: TimetablePossibility): boolean {
    return filterAccepts(this._ctx, this.filter, possibility);
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
  x: TimetablePossibility,
) {
  // Filter by line.
  if (filter.lines != null && !filter.lines.some((l) => l == x.entry.line)) {
    return false;
  }

  // Filter by direction.
  if (
    filter.directions != null &&
    !filter.directions.some((d) => d == x.entry.direction)
  ) {
    return false;
  }

  // Filter by platform.
  const platform = guessPlatformOfPossibility(ctx, x);
  if (
    filter.platforms != null &&
    (platform == null || !filter.platforms.some((p) => p == platform.id))
  ) {
    return false;
  }

  // Filter by service type.
  const line = requireLine(ctx.getConfig(), x.entry.line);
  if (
    filter.serviceTypes != null &&
    !filter.serviceTypes.some((s) => s == line.serviceType)
  ) {
    return false;
  }

  // Filter arrivals.
  const isArrival = x.entry.rows
    .slice(x.perspectiveIndex + 1)
    .every((x) => x == null);
  if (!filter.arrivals && isArrival) {
    return false;
  }

  // Filter set-down-only services.
  const picksUp = line.route.picksUp(
    x.entry.route,
    x.entry.direction,
    x.perspectiveIndex,
  );
  if (!filter.setDownOnly && !picksUp) {
    return false;
  }

  return true;
}
