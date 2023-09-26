import { QDayOfWeek } from "../../shared/qtime/qdayofweek";
import { LineColor } from "../../shared/system/enums";
import {
  DirectionID,
  LineID,
  PlatformID,
  RouteVariantID,
  StopID,
} from "../../shared/system/ids";
import { ServiceType } from "../../shared/system/service-type";

// In order to add this to the server config, the server config should be
// brought out of the shared folder (use the opportunity to split frontend and
// shared from the same file too, that file's packed)!

type StopPlatformRule = {
  // TODO: This should probably be an enum?
  confidence: string;
  rules: Map<PlatformID, PlatformFilter[]>;
};

export class PlatformRules {
  constructor(readonly rules: Map<StopID, StopPlatformRule>) {}
}

const clauseMatchers = [
  /^!?line-[0-9]+$/g,
  /^!?color-[a-z0-9]+(-[a-z0-9]+)*$/g,
  /^!?direction-[a-z0-9]+(-[a-z0-9]+)*$/g,
  /^!?route-variant-[a-z0-9]+(-[a-z0-9]+)*$/g,
  /^!?service-type-[a-z0-9]+(-[a-z0-9]+)*$/g,
  /^!?originates-at-[0-9]+$/g,
  /^!?stops-at-[0-9]+$/g,
  /^!?terminates-at-[0-9]+$/g,
  /^!?weekday$/g,
  /^!?weekend$/g,
];

type RelavantServiceData = {
  line: LineID;
  color: LineColor;
  direction: DirectionID;
  routeVariant: RouteVariantID;
  serviceType: ServiceType;
  origin: StopID;
  stops: StopID[];
  terminus: StopID;
  dayOfWeek: QDayOfWeek;
};

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

  matches(service: RelavantServiceData) {
    return this.clauses.every((c) => matchesClause(c, service));
  }
}

function negate(matches: boolean, negated: boolean) {
  return negated ? !matches : matches;
}

function matchesClause(clause: string, service: RelavantServiceData) {
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
  } else if (absClause.startsWith("originates-at-")) {
    return negate(
      absClause == `originates-at-${service.origin.toFixed()}`,
      negated
    );
  } else if (absClause.startsWith("stops-at-")) {
    return negate(
      service.stops.some((s) => absClause == `stops-at-${s.toFixed()}`),
      negated
    );
  } else if (absClause.startsWith("terminates-at-")) {
    return negate(
      absClause == `terminates-at-${service.terminus.toFixed()}`,
      negated
    );
  } else if (absClause == `weekend`) {
    return negate(service.dayOfWeek.isWeekend(), negated);
  } else if (absClause == `weekday`) {
    return negate(!service.dayOfWeek.isWeekend(), negated);
  } else {
    throw new Error(`Unrecognised clause "${clause}".`);
  }
}
