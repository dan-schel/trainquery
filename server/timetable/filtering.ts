import { requireLine } from "../../shared/system/config-utils";
import { StopID } from "../../shared/system/ids";
import { Departure } from "../../shared/system/timetable/departure";
import { DepartureFilter } from "../../shared/system/timetable/departure-filter";
import { TrainQuery } from "../trainquery";
import { Bucket } from "./get-departures";
import { Possibility } from "./get-possibilities";
import { guessPlatformOfPossibility } from "./guess-platform";

export class FilteredBucket extends Bucket<Departure> {
  readonly departures: Departure[] = [];

  constructor(
    private readonly _ctx: TrainQuery,
    readonly stop: StopID,
    readonly capacity: number,
    readonly filter: DepartureFilter
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
  x: Possibility
) {
  if (filter.lines != null && !filter.lines.some((l) => l == x.entry.line)) {
    return false;
  }
  if (
    filter.directions != null &&
    !filter.directions.some((d) => d == x.entry.direction)
  ) {
    return false;
  }

  const platform = guessPlatformOfPossibility(ctx, x);
  if (
    filter.platforms != null &&
    (platform == null || !filter.platforms.some((p) => p == platform.id))
  ) {
    return false;
  }

  const line = requireLine(ctx.getConfig(), x.entry.line);
  if (
    filter.serviceTypes != null &&
    !filter.serviceTypes.some((s) => s == line.serviceType)
  ) {
    return false;
  }

  // TODO: Filter set-down-only services.

  // TODO: Filter arrivals.

  return true;
}
