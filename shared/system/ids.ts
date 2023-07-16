import { z } from "zod";

declare const StopIDBrand: unique symbol;
declare const LineIDBrand: unique symbol;
declare const PlatformIDBrand: unique symbol;
declare const DirectionIDBrand: unique symbol;
declare const RouteVariantIDBrand: unique symbol;
declare const ServiceTypeIDBrand: unique symbol;

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

/** Matches a positive integer. */
export const StopIDJson = z
  .number()
  .refine((x) => isStopID(x))
  .transform((x) => toStopID(x));
/** Matches a positive integer. */
export const LineIDJson = z
  .number()
  .refine((x) => isLineID(x))
  .transform((x) => toLineID(x));
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

function isPositiveInteger(val: number) {
  return Number.isInteger(val) && val >= 1;
}
function isKebabCase(val: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(val);
}
function badID(
  type:
    | "stop"
    | "line"
    | "platform"
    | "direction"
    | "route variant"
    | "service type",
  val: number | string
): Error {
  return new Error(`Bad ${type} ID: ${val}`);
}
