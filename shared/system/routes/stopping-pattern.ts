import { type DirectionID, type LineID, type RouteVariantID } from "../ids";
import { RouteStop } from "./route-stop";

export class StoppingPattern {
  constructor(
    readonly line: LineID,
    readonly variant: RouteVariantID,
    readonly direction: DirectionID,
    readonly stops: RouteStop[],
  ) {}
}
