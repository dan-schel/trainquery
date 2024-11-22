import { z } from "zod";
import { type PlatformID, PlatformIDJson, toPlatformID } from "./ids";

/** Describes the name of a platform. */
export class Platform {
  constructor(
    /** Uniquely identifies this platform from others at this stop. */
    readonly id: PlatformID,
    /** The user-facing platform name, e.g. '1' or '15A'. */
    readonly name: string,
  ) {}

  static readonly json = z
    .object({
      id: z.union([z.number(), PlatformIDJson]),
      name: z.union([z.number(), z.string()]).optional(),
    })
    .transform(
      (x) => new Platform(fuzzyPlatformID(x.id), fuzzyName(x.name ?? x.id)),
    );

  toJSON(): z.input<typeof Platform.json> {
    return {
      id: this.id,
      name: this.name === this.id ? undefined : this.name,
    };
  }
}

function fuzzyPlatformID(val: PlatformID | number): PlatformID {
  if (typeof val === "number") {
    return toPlatformID(val.toFixed());
  }
  return val;
}
function fuzzyName(val: string | number): string {
  if (typeof val === "number") {
    return val.toFixed();
  }
  return val;
}
