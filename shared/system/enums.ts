import { z } from "zod";

/** All line colors supported by the frontend. */
export const LineColors = [
  "none",
  "red",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
] as const;
/** All supported line route types. */
export const LineRouteTypes = ["linear", "y-branch", "hook"] as const;
/** All supported service modes. */
export const ServiceModes = ["suburban-train", "regional-train"] as const;

/** One of a list of pre-defined color options. */
export type LineColor = (typeof LineColors)[number];
/** E.g. 'linear', 'y-branch', etc. */
export type LineRouteType = (typeof LineRouteTypes)[number];
/** E.g. 'suburban-train', 'regional-train', etc. */
export type ServiceMode = (typeof ServiceModes)[number];

/** Matches a value in {@link LineColors}. */
export const LineColorJson = z.enum(LineColors);
/** Matches a value in {@link LineRouteTypes}. */
export const LineRouteTypeJson = z.enum(LineRouteTypes);
/** Matches a value in {@link ServiceModes}. */
export const ServiceModeJson = z.enum(ServiceModes);
