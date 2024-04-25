import { z } from "zod";
import { Departure } from "../system/service/departure";
import { Disruption } from "./disruption";

export class DepartureWithDisruptions {
  constructor(
    readonly departure: Departure,
    readonly disruptions: Disruption<string>[],
  ) {}

  static json = z
    .object({
      departure: Departure.json,
      disruptions: DisruptionJson.array(),
    })
    .transform((x) => new DepartureWithDisruptions(x.departure, x.disruptions));

  toJSON(): z.input<typeof DepartureWithDisruptions.json> {
    return {
      departure: this.departure.toJSON(),
      disruptions: this.disruptions,
    };
  }
}
