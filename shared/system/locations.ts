import { z } from "zod";
import { mapJson } from "../utils";
import { type StopID, StopIDStringJson } from "./ids";

type StopCoordinates = {
  latitude: number;
  longitude: number;
};

export class Locations {
  static readonly default = new Locations(new Map());

  constructor(readonly locations: Map<StopID, StopCoordinates>) {}

  static readonly json = mapJson(
    StopIDStringJson,
    z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  ).transform((x) => new Locations(x));

  toJSON(): z.input<typeof Locations.json> {
    return Object.fromEntries(this.locations);
  }

  get(stop: StopID) {
    return this.locations.get(stop) ?? null;
  }
}
