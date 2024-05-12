import { z } from "zod";
import { Departure } from "../system/service/departure";
import { Disruption } from "./disruption";
import { DisruptionJson, disruptionToJson } from "./disruption-json";

export class DepartureWithDisruptions {
  constructor(
    readonly departure: Departure,
    readonly disruptions: Disruption[],
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
      disruptions: this.disruptions.map((x) => disruptionToJson(x)),
    };
  }
}
