import { DirectionID, LineID, RouteVariantID, StopID } from "../ids";

export function matchToRoute<T>(stoppingOrder: { stop: StopID, value: T }[]): {
  line: LineID,
  associatedLines: LineID[],
  route: RouteVariantID,
  direction: DirectionID,
  values: (T | null)[]
} | null {
  // TODO: Write route matching code.
  return null;
}
