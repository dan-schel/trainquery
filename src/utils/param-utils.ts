import type { LocationQueryValue } from "vue-router";

export function unparam(
  param: LocationQueryValue | LocationQueryValue[] | string | string[]
): string | null;
export function unparam(
  param: LocationQueryValue | LocationQueryValue[] | string | string[],
  defaultValue: string
): string;
export function unparam(
  param: LocationQueryValue | LocationQueryValue[] | string | string[],
  defaultValue?: string
): string | null {
  const value = Array.isArray(param) ? param[0] : param;
  if (value == null) {
    return value ?? defaultValue ?? null;
  }
  return value;
}

export function requiredParam(
  param: LocationQueryValue | LocationQueryValue[] | string | string[]
): string {
  const value = unparam(param);
  if (value == null) {
    throw new Error("Required route param missing.");
  }
  return value;
}

export function nullableEquals<T extends { equals: (other: T) => boolean }>(
  a: T | null,
  b: T | null
) {
  if (a == null) {
    return b == null;
  } else if (b == null) {
    return false;
  } else {
    return a.equals(b);
  }
}
