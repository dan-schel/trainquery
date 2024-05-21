import { z } from "zod";
import {
  ConfidenceLevel,
  ConfidenceLevelJson,
} from "../../shared/system/enums";
import {
  PlatformID,
  PlatformIDJson,
  StopID,
  StopIDStringJson,
} from "../../shared/system/ids";
import { mapJson } from "../../shared/utils";
import { PlatformFilteringData } from "../timetable/filtering";

type StopPlatformRule = {
  confidence: ConfidenceLevel;
  rules: Map<PlatformID, PlatformFilter[]>;
};

export class PlatformRules {
  constructor(readonly rules: Map<StopID, StopPlatformRule>) {}

  static readonly json = mapJson(
    StopIDStringJson,
    z.object({
      confidence: ConfidenceLevelJson,
      rules: mapJson(
        PlatformIDJson,
        z.string().transform((x, ctx) => {
          const result = PlatformFilter.parseMany(x);
          if (result == null) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Not a valid list of platform filters.",
            });
            return z.NEVER;
          }
          return result;
        }),
      ),
    }),
  ).transform((x) => new PlatformRules(x));

  get(stop: StopID) {
    return this.rules.get(stop) ?? null;
  }
}

const clauseMatchers = [
  /^!?line-[0-9]+$/,
  /^!?color-[a-z0-9]+(-[a-z0-9]+)*$/,
  /^!?direction-[a-z0-9]+(-[a-z0-9]+)*$/,
  /^!?route-variant-[a-z0-9]+(-[a-z0-9]+)*$/,
  /^!?service-type-[a-z0-9]+(-[a-z0-9]+)*$/,
  /^!?originates-at-[0-9]+$/,
  /^!?stops-at-[0-9]+$/,
  /^!?terminates-at-[0-9]+$/,
  /^!?weekday$/,
  /^!?weekend$/,
  /^none$/,
];

export class PlatformFilter {
  constructor(readonly clauses: string[]) {}

  static parse(input: string): PlatformFilter | null {
    const clauses = input
      .split(" ")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    if (!clauses.every((c) => clauseMatchers.some((m) => m.test(c)))) {
      return null;
    }

    return new PlatformFilter(clauses);
  }

  static parseMany(input: string): PlatformFilter[] | null {
    const filters = input.split(",").map((x) => PlatformFilter.parse(x));
    if (filters.some((x) => x == null)) {
      return null;
    }
    return filters as PlatformFilter[];
  }

  matches(service: PlatformFilteringData) {
    return this.clauses.every((c) => matchesClause(c, service));
  }
}

function negate(matches: boolean, negated: boolean) {
  return negated ? !matches : matches;
}

function matchesClause(clause: string, service: PlatformFilteringData) {
  const negated = clause.startsWith("!");
  const absClause = clause.replace("!", "");

  if (absClause.startsWith("line-")) {
    return negate(absClause === `line-${service.line.id.toFixed()}`, negated);
  } else if (absClause.startsWith("color-")) {
    return negate(absClause === `color-${service.color}`, negated);
  } else if (absClause.startsWith("direction-")) {
    return negate(absClause === `direction-${service.direction}`, negated);
  } else if (absClause.startsWith("route-variant-")) {
    return negate(
      absClause === `route-variant-${service.routeVariant}`,
      negated,
    );
  } else if (absClause.startsWith("service-type-")) {
    return negate(absClause === `service-type-${service.serviceType}`, negated);
  } else if (absClause.startsWith("originates-at-")) {
    return negate(
      absClause === `originates-at-${service.origin.toFixed()}`,
      negated,
    );
  } else if (absClause.startsWith("stops-at-")) {
    return negate(
      service.stops.some((s) => absClause === `stops-at-${s.toFixed()}`),
      negated,
    );
  } else if (absClause.startsWith("terminates-at-")) {
    return negate(
      absClause === `terminates-at-${service.terminus.toFixed()}`,
      negated,
    );
  } else if (absClause === `weekend`) {
    return negate(service.dayOfWeek.isWeekend(), negated);
  } else if (absClause === `weekday`) {
    return negate(!service.dayOfWeek.isWeekend(), negated);
  } else if (clause === "none") {
    // "none" cannot be negated.
    return false;
  } else {
    throw new Error(`Unrecognised clause "${clause}".`);
  }
}
