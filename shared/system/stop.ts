import { StopID, StopIDJson } from "./ids";
import { z } from "zod";
import { Platform } from "./platform";

/** Describes the name and platforms of a particular transit stop. */
export class Stop {
  constructor(
    /** Uniquely identifies this stop from others in the system. */
    readonly id: StopID,
    /** E.g. 'Pakenham'. */
    readonly name: string,
    /** The platforms this stop has, if this transit system has platforms. */
    readonly platforms: readonly Platform[]
  ) {
    this.id = id;
    this.name = name;
    this.platforms = platforms;
  }

  static readonly json = z
    .object({
      id: StopIDJson,
      name: z.string(),
      platforms: Platform.json.array().default([]),
    })
    .transform((x) => new Stop(x.id, x.name, x.platforms));

  toJSON(): z.input<typeof Stop.json> {
    return {
      id: this.id,
      name: this.name,
      platforms:
        this.platforms.length == 0
          ? undefined
          : this.platforms.map((p) => p.toJSON()),
    };
  }
}
