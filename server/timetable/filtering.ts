import { requireLine } from "../../shared/system/config-utils";
import { StopID } from "../../shared/system/ids";
import { Departure } from "../../shared/system/service/departure";
import { DepartureFilter } from "../../shared/system/timetable/departure-filter";
import { Possibility } from "../departures/timetable-departure-source";
import { TrainQuery } from "../trainquery";
import { Bucket } from "./get-departures";
import { guessPlatformOfPossibility } from "./guess-platform";

export class FilteredBucket extends Bucket<Possibility, Departure> {
  readonly departures: Departure[] = [];

  constructor(
    private readonly _ctx: TrainQuery,
    readonly stop: StopID,
    readonly capacity: number,
    readonly filter: DepartureFilter,
  ) {
    super();
  }

  willAccept(possibility: Possibility): boolean {
    return filterAccepts(this._ctx, this.filter, possibility);
  }
  push(service: Departure): void {
    this.departures.push(service);
  }
  isFull(): boolean {
    return this.departures.length >= this.capacity;
  }
}

function filterAccepts(
  ctx: TrainQuery,
  filter: DepartureFilter,
  x: Possibility,
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
