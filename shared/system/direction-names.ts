import { z } from "zod";
import { type DirectionID, DirectionIDJson } from "./ids";
import { mapJson } from "../utils";

/** Provides the strings used for the stop and line page URLs. */
export class DirectionNames {
  constructor(
    readonly names: Map<DirectionID, { regular: string; capital: string }>
  ) {}

  getName(direction: DirectionID, capital: boolean) {
    const names = this.names.get(direction);
    if (names == null) {
      return null;
    }
    return capital ? names.capital : names.regular;
  }

  static readonly json = mapJson(
    DirectionIDJson,
    z.object({
      regular: z.string(),
      capital: z.string(),
    })
  ).transform((x) => new DirectionNames(x));

  toJSON(): z.input<typeof DirectionNames.json> {
    return Object.fromEntries(this.names);
  }
}
