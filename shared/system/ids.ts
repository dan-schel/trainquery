import { parseIntNull, parseIntThrow } from "@dan-schel/js-utils";
import { z } from "zod";

declare const StopIDBrand: unique symbol;
declare const LineIDBrand: unique symbol;
declare const PlatformIDBrand: unique symbol;
declare const DirectionIDBrand: unique symbol;
declare const RouteVariantIDBrand: unique symbol;
declare const ServiceTypeIDBrand: unique symbol;
declare const TimetableIDBrand: unique symbol;
declare const StaticServiceIDBrand: unique symbol;
declare const DisruptionIDBrand: unique symbol;
declare const ExternalDisruptionIDBrand: unique symbol;

/** Guaranteed to be a positive integer. */
export type StopID = number & { [StopIDBrand]: true };
/** Guaranteed to be a positive integer. */
export type LineID = number & { [LineIDBrand]: true };
/** Guaranteed to be a kebab-case string. */
export type PlatformID = string & { [PlatformIDBrand]: true };
/** Guaranteed to be a kebab-case string. */
export type DirectionID = string & { [DirectionIDBrand]: true };
/** Guaranteed to be a kebab-case string. */
export type RouteVariantID = string & { [RouteVariantIDBrand]: true };
/** Guaranteed to be a kebab-case string. */
export type ServiceTypeID = string & { [ServiceTypeIDBrand]: true };
/** Guaranteed to be a positive integer. */
export type TimetableID = number & { [TimetableIDBrand]: true };
/** Guaranteed to be a non-empty string. */
export type StaticServiceID = string & { [StaticServiceIDBrand]: true };
/** Guaranteed to be a non-empty string. */
export type DisruptionID = string & { [DisruptionIDBrand]: true };
/** Guaranteed to be a non-empty string. */
export type ExternalDisruptionID = string & {
  [ExternalDisruptionIDBrand]: true;
};

/** Matches a positive integer. */
export function isStopID(id: number): id is StopID {
  return isPositiveInteger(id);
}
/** Matches a positive integer. */
export function isLineID(id: number): id is LineID {
  return isPositiveInteger(id);
}
/** Matches a kebab-case string. */
export function isPlatformID(id: string): id is PlatformID {
  return isKebabCase(id);
}
/** Matches a kebab-case string. */
export function isDirectionID(id: string): id is DirectionID {
  return isKebabCase(id);
}
/** Matches a kebab-case string. */
export function isRouteVariantID(id: string): id is RouteVariantID {
  return isKebabCase(id);
}
/** Matches a kebab-case string. */
export function isServiceTypeID(id: string): id is ServiceTypeID {
  return isKebabCase(id);
}
/** Matches a positive integer. */
export function isTimetableID(id: number): id is TimetableID {
  return isPositiveInteger(id);
}
/** Matches any (non-empty) string. */
export function isStaticServiceID(id: string): id is StaticServiceID {
  return id.length > 0;
}
/** Matches any (non-empty) string. */
export function isDisruptionID(id: string): id is DisruptionID {
  return id.length > 0;
}
/** Matches any (non-empty) string. */
export function isExternalDisruptionID(id: string): id is ExternalDisruptionID {
  return id.length > 0;
}

/** Throws unless provided a positive integer. */
export function toStopID(id: number): StopID {
  if (isStopID(id)) {
    return id;
  }
  throw badID("stop", id);
}
/** Throws unless provided a positive integer. */
export function toLineID(id: number): LineID {
  if (isLineID(id)) {
    return id;
  }
  throw badID("line", id);
}
/** Throws unless provided a kebab-case string. */
export function toPlatformID(id: string): PlatformID {
  if (isPlatformID(id)) {
    return id;
  }
  throw badID("platform", id);
}
/** Throws unless provided a kebab-case string. */
export function toDirectionID(id: string): DirectionID {
  if (isDirectionID(id)) {
    return id;
  }
  throw badID("direction", id);
}
/** Throws unless provided a kebab-case string. */
export function toRouteVariantID(id: string): RouteVariantID {
  if (isRouteVariantID(id)) {
    return id;
  }
  throw badID("route variant", id);
}
/** Throws unless provided a kebab-case string. */
export function toServiceTypeID(id: string): ServiceTypeID {
  if (isServiceTypeID(id)) {
    return id;
  }
  throw badID("service type", id);
}
/** Throws unless provided a positive integer. */
export function toTimetableID(id: number): TimetableID {
  if (isTimetableID(id)) {
    return id;
  }
  throw badID("timetable", id);
}
/** Throws unless provided a non-empty string. */
export function toStaticServiceID(id: string): StaticServiceID {
  if (isStaticServiceID(id)) {
    return id;
  }
  throw badID("static service", id);
}
/** Throws unless provided a non-empty string. */
export function toDisruptionID(id: string): DisruptionID {
  if (isDisruptionID(id)) {
    return id;
  }
  throw badID("disruption", id);
}
/** Throws unless provided a non-empty string. */
export function toExternalDisruptionID(id: string): ExternalDisruptionID {
  if (isExternalDisruptionID(id)) {
    return id;
  }
  throw badID("external disruption", id);
}

/** Matches a positive integer. */
export const StopIDJson = z
  .number()
  .refine((x) => isStopID(x))
  .transform((x) => toStopID(x));
/** Matches a positive integer printed as a string. */
export const StopIDStringJson = z
  .string()
  .refine((s) => parseIntNull(s) != null && isStopID(parseIntThrow(s)))
  .transform((s) => StopIDJson.parse(parseIntThrow(s)));
/** Matches a positive integer. */
export const LineIDJson = z
  .number()
  .refine((x) => isLineID(x))
  .transform((x) => toLineID(x));
/** Matches a positive integer printed as a string. */
export const LineIDStringJson = z
  .string()
  .refine((l) => parseIntNull(l) != null && isLineID(parseIntThrow(l)))
  .transform((s) => LineIDJson.parse(parseIntThrow(s)));
/** Matches a kebab-case string. */
export const PlatformIDJson = z
  .string()
  .refine((x) => isPlatformID(x))
  .transform((x) => toPlatformID(x));
/** Matches a kebab-case string. */
export const DirectionIDJson = z
  .string()
  .refine((x) => isDirectionID(x))
  .transform((x) => toDirectionID(x));
/** Matches a kebab-case string. */
export const RouteVariantIDJson = z
  .string()
  .refine((x) => isRouteVariantID(x))
  .transform((x) => toRouteVariantID(x));
/** Matches a kebab-case string. */
export const ServiceTypeIDJson = z
  .string()
  .refine((x) => isServiceTypeID(x))
  .transform((x) => toServiceTypeID(x));
/** Matches a positive integer. */
export const TimetableIDJson = z
  .number()
  .refine((x) => isTimetableID(x))
  .transform((x) => toTimetableID(x));
/** Matches a non-empty string. */
export const StaticServiceIDJson = z
  .string()
  .refine((x) => isStaticServiceID(x))
  .transform((x) => toStaticServiceID(x));
/** Matches a non-empty string. */
export const DisruptionIDJson = z
  .string()
  .refine((x) => isDisruptionID(x))
  .transform((x) => toDisruptionID(x));
/** Matches a non-empty string. */
export const ExternalDisruptionIDJson = z
  .string()
  .refine((x) => isExternalDisruptionID(x))
  .transform((x) => toExternalDisruptionID(x));

function isPositiveInteger(val: number) {
  return Number.isInteger(val) && val >= 1;
}
export function isKebabCase(val: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(val);
}
function badID(
  type:
    | "stop"
    | "line"
    | "platform"
    | "direction"
    | "route variant"
    | "service type"
    | "timetable"
    | "static service"
    | "disruption"
    | "external disruption",
  val: number | string,
): Error {
  return new Error(`Bad ${type} ID: ${val}`);
}
