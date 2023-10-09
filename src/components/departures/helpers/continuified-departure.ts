import type { StopID } from "shared/system/ids";
import { Departure } from "shared/system/timetable/departure";
import type { Service } from "shared/system/timetable/service";
import {
  getContinuifiedStops,
  type ContinuifiedStop,
  type ContinuifiedServedStop,
} from "./continuified-stop";

export class ContinuifiedDeparture {
  constructor(
    readonly allRaw: ContinuifiedStop[],
    readonly all: ContinuifiedStop[],
    readonly relevant: ContinuifiedStop[],
    readonly perspectiveIndex: number
  ) {}

  static build(departure: Departure, continuationsEnabled: boolean) {
    const stints: Service[] = [departure];

    let service: Service | null = departure.continuation;
    while (continuationsEnabled && service != null) {
      stints.push(service);
      service = service.continuation;
    }

    const allDuped = merge(stints);
    const all = dedupe(allDuped);
    const relevant = trimRelevant(all, departure.perspectiveIndex);
    return new ContinuifiedDeparture(
      allDuped,
      all,
      relevant,
      departure.perspectiveIndex
    );
  }

  forStint(index: number, { relevant = true }: { relevant?: boolean } = {}) {
    return relevant
      ? this.relevant.filter((s) => s.stintIndex == index)
      : this.allRaw.filter((s) => s.stintIndex == index);
  }

  isArrival() {
    const firstStint = this.forStint(0, { relevant: false });
    const index = firstStint.findIndex(
      (s) => s.stopListIndex == this.perspectiveIndex
    );
    return index == firstStint.length - 1;
  }

  origin() {
    return this.allRaw[0];
  }

  perspectiveStop(): ContinuifiedServedStop {
    const stop = this.relevant[0];
    if (stop.type != "served") {
      throw new Error("Perspective stop must be known as being served.");
    }
    return stop;
  }

  relevantTerminus(): ContinuifiedServedStop {
    const terminus = this.relevant[this.relevant.length - 1];
    if (terminus.type != "served") {
      throw new Error("Relevant terminus must be known as being served.");
    }
    return terminus;
  }

  relevantServedStops(): ContinuifiedServedStop[] {
    return this.relevant.filter(
      (s): s is ContinuifiedServedStop => s.type == "served"
    );
  }

  hasContinuation() {
    return this.allRaw.some((s) => s.stintIndex != 0);
  }
}

function merge(stints: Service[]): ContinuifiedStop[] {
  const all: ContinuifiedStop[] = [];
  let previousStintTerminus: StopID | null = null;
  stints.forEach((s, i) => {
    const stops: ContinuifiedStop[] = getContinuifiedStops(
      s,
      previousStintTerminus
    ).map((x) => ({
      ...x,
      stintIndex: i,
      stint: s,
    }));

    previousStintTerminus = stops[stops.length - 1].stop;
    all.push(...stops);
  });

  return all;
}

function dedupe(allRaw: ContinuifiedStop[]): ContinuifiedStop[] {
  return allRaw.filter((s, i) => {
    const next = allRaw[i + 1];
    if (next == null) {
      return true;
    }
    return next.stintIndex == s.stintIndex || next.stop != s.stop;
  });
}

function trimRelevant(
  all: ContinuifiedStop[],
  perspectiveIndex: number
): ContinuifiedStop[] {
  const trimmed = [];
  const seen = new Set<StopID>();
  let started = false;

  for (const stop of all) {
    if (stop.stintIndex != 0 || stop.stopListIndex >= perspectiveIndex) {
      started = true;
    }

    if (started) {
      // Consider "unknown" to be the same as "served" for trimming purposes.
      if (stop.type != "express") {
        if (seen.has(stop.stop)) {
          // We've now come to a stop we've been to before, so trim the list
          // here. There's also no point including any express stops since the
          // last stop in the list, so let's trim them off now.
          while (trimmed[trimmed.length - 1].type == "express") {
            trimmed.splice(trimmed.length - 1, 1);
          }
        } else {
          seen.add(stop.stop);
        }
      }

      trimmed.push(stop);
    }
  }

  return trimmed;
}
