import { z } from "zod";
import { Departure } from "../system/service/departure";
import { Disruption } from "./processed/disruption";

export class DepartureWithDisruptions {
  constructor(
    readonly departure: Departure,
    readonly disruptions: Disruption[],
  ) {}

  static readonly json = z
    .object({
      departure: Departure.json,
      disruptions: Disruption.json.array(),
    })
    .transform((x) => new DepartureWithDisruptions(x.departure, x.disruptions));

  toJSON(): z.input<typeof DepartureWithDisruptions.json> {
    return {
      departure: this.departure.toJSON(),
      disruptions: this.disruptions.map((x) => x.toJSON()),
    };
  }
}
