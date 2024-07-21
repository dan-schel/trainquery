import { z } from "zod";
import { type LineRouteType } from "../enums";
import { type DirectionID, DirectionIDJson, type StopID } from "../ids";
import { unique } from "@dan-schel/js-utils";
import { StopList, StopListID } from "./stop-list/stop-list";
import { Lazy } from "../../utils";

/** Describes the stops and route a line takes. */
export abstract class Route {
  private readonly _stopLists: Lazy<StopList[]>;

  constructor(
    /** E.g. 'linear', 'y-branch', etc. */
    readonly type: LineRouteType,
  ) {
    this._stopLists = new Lazy(() => this.defineStopLists());
  }

  protected abstract defineStopLists(): StopList[];

  getStopLists(): StopList[] {
    return this._stopLists.get();
  }

  getStopList(id: StopListID): StopList | null {
    return this._stopLists.get().find((l) => l.id.equals(id)) ?? null;
  }

  requireStopList(id: StopListID): StopList {
    const result = this.getStopList(id);
    if (result == null) {
      throw badStopListID(id);
    }
    return result;
  }

  /** Could a service on this line stop at this stop? */
  isPossibleStop(stop: StopID) {
    return this._stopLists
      .get()
      .some((l) => l.possibleStops.some((s) => s.stop === stop));
  }
  /** Is this stop considered to be "on this line". */
  isCanonicalStop(stop: StopID) {
    return this._stopLists
      .get()
      .some((l) => l.canonicalStops.some((s) => s.stop === stop));
  }
  /** The set of all direction IDs used by this line. */
  getPossibleDirections(): DirectionID[] {
    return unique(
      this._stopLists.get().map((l) => l.id.direction),
      (a, b) => a === b,
    );
  }
}

export class DirectionDefinition {
  constructor(
    /** Uniquely identify this direction from others on this line. */
    readonly id: DirectionID,
  ) {}

  static readonly json = z
    .object({
      id: DirectionIDJson,
    })
    .transform((x) => new DirectionDefinition(x.id));

  toJSON(): z.input<typeof DirectionDefinition.json> {
    return {
      id: this.id,
    };
  }
}

export function badStopListID(id: StopListID): Error {
  return new Error(
    `Route variant "${id.variant}" and direction "${id.direction}" is invalid for this line.`,
  );
}
