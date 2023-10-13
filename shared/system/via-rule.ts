import { z } from "zod";
import {
  type StopID,
  type LineID,
  type DirectionID,
  type RouteVariantID,
  type ServiceTypeID,
} from "./ids";
import { type LineColor } from "./enums";

const clauseMatchers = [
  /^!?line-[0-9]+$/,
  /^!?color-[a-z0-9]+(-[a-z0-9]+)*$/,
  /^!?direction-[a-z0-9]+(-[a-z0-9]+)*$/,
  /^!?route-variant-[a-z0-9]+(-[a-z0-9]+)*$/,
  /^!?service-type-[a-z0-9]+(-[a-z0-9]+)*$/,
  /^!?will-stop-at-[0-9]+$/,
  /^!?terminates-at-[0-9]+$/,
  /^!?continues$/,
];

export type ViaRuleFilteringData = {
  line: LineID;
  color: LineColor;
  direction: DirectionID;
  routeVariant: RouteVariantID;
  serviceType: ServiceTypeID;
  futureStops: StopID[];
  terminus: StopID;
  continues: boolean;
};

export class ViaRuleFilter {
  constructor(readonly clauses: string[]) {}

  static readonly manyJson = z.string().transform((x, ctx) => {
    const result = ViaRuleFilter.parseMany(x);
    if (result == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Not a valid string of via rule filters",
      });
      return z.NEVER;
    }
    return result;
  });

  static parse(input: string): ViaRuleFilter | null {
    const clauses = input
      .split(" ")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    if (!clauses.every((c) => clauseMatchers.some((m) => m.test(c)))) {
      return null;
    }

    return new ViaRuleFilter(clauses);
  }

  static parseMany(input: string): ViaRuleFilter[] | null {
    const filters = input.split(",").map((x) => ViaRuleFilter.parse(x));
    if (filters.some((x) => x == null)) {
      return null;
    }
    return filters as ViaRuleFilter[];
  }

  matches(service: ViaRuleFilteringData) {
    return this.clauses.every((c) => matchesClause(c, service));
  }

  toJSON(): string {
    return this.clauses.join(" ");
  }
}

export class ViaRule {
  constructor(readonly text: string, readonly rules: ViaRuleFilter[]) {}

  static readonly json = z
    .object({
      text: z.string(),
      rules: ViaRuleFilter.manyJson,
    })
    .transform((x) => new ViaRule(x.text, x.rules));

  toJSON(): z.input<typeof ViaRule.json> {
    return {
      text: this.text,
      rules: this.rules.map((r) => r.toJSON()).join(", "),
    };
  }
}

function negate(matches: boolean, negated: boolean) {
  return negated ? !matches : matches;
}

function matchesClause(clause: string, service: ViaRuleFilteringData) {
  const negated = clause.startsWith("!");
  const absClause = clause.replace("!", "");

  if (absClause.startsWith("line-")) {
    return negate(absClause == `line-${service.line.toFixed()}`, negated);
  } else if (absClause.startsWith("color-")) {
    return negate(absClause == `color-${service.color}`, negated);
  } else if (absClause.startsWith("direction-")) {
    return negate(absClause == `direction-${service.direction}`, negated);
  } else if (absClause.startsWith("route-variant-")) {
    return negate(
      absClause == `route-variant-${service.routeVariant}`,
      negated
    );
  } else if (absClause.startsWith("service-type-")) {
    return negate(absClause == `service-type-${service.serviceType}`, negated);
  } else if (absClause.startsWith("will-stop-at-")) {
    return negate(
      service.futureStops.some(
        (s) => absClause == `will-stop-at-${s.toFixed()}`
      ),
      negated
    );
  } else if (absClause.startsWith("terminates-at-")) {
    return negate(
      absClause == `terminates-at-${service.terminus.toFixed()}`,
      negated
    );
  } else if (absClause == "continues") {
    return negate(service.continues, negated);
  } else {
    throw new Error(`Unrecognised clause "${clause}".`);
  }
}
