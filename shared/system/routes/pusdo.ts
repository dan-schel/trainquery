import { z } from "zod";
import { type DirectionID, isDirectionID } from "../ids";

/** Pick Up and Set Down Only filter. */
export class PusdoFilter {
  static all = new PusdoFilter(null, false);
  static none = new PusdoFilter(null, true);

  constructor(
    readonly directions: DirectionID[] | null,
    readonly none: boolean
  ) {}

  static json = z.string().transform((x, ctx) => {
    const result = PusdoFilter.parse(x);
    if (result == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a PUSDO filter",
      });
      return z.NEVER;
    }
    return result;
  });

  toJSON(): z.input<typeof PusdoFilter.json> {
    return this.asString();
  }

  asString() {
    if (this.none) {
      return "none";
    }

    const filters: string[] = [];

    if (this.directions != null) {
      filters.push(
        ...this.directions
          .map((d) => `direction-${d}`)
          .sort((a, b) => a.localeCompare(b))
      );
    }
    return filters.join(" ");
  }

  static parse(input: string) {
    const directions: DirectionID[] = [];

    for (const term of input
      .split(" ")
      .map((x) => x.trim())
      .filter((x) => x.length > 0)) {
      if (term == "none") {
        return PusdoFilter.none;
      } else if (term.startsWith("direction-")) {
        const direction = term.replace("direction-", "");
        if (!isDirectionID(direction)) {
          return null;
        }
        directions.push(direction);
      } else {
        return null;
      }
    }

    return new PusdoFilter(directions.length == 0 ? null : directions, false);
  }

  matches(direction: DirectionID) {
    if (this.none) {
      return false;
    }

    if (
      this.directions != null &&
      !this.directions.some((d) => d == direction)
    ) {
      return false;
    }

    return true;
  }
}
