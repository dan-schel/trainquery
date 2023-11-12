import { z } from "zod";
import { Departure } from "../system/service/departure";
import {
  DisruptionJson,
  type SerializedDisruption,
} from "./serialized-disruption";

export class DepartureWithDisruptions {
  constructor(
    readonly departure: Departure,
    readonly disruptions: SerializedDisruption[],
  ) {}

  static json = z.object({
    departure: Departure.json,
    disruptions: DisruptionJson.array(),
  });

  toJSON(): z.input<typeof DepartureWithDisruptions.json> {
    return {
      departure: this.departure.toJSON(),
      disruptions: this.disruptions,
    };
  }
}
