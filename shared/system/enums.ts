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
/** All supported confidence levels. */
export const ConfidenceLevels = ["low", "medium", "high"] as const;
/** All supported line visibility values. */
export const LineVisibilityValues = [
  "regular",
  "special-events-only",
  "hidden",
] as const;

/** One of a list of pre-defined color options. */
export type LineColor = (typeof LineColors)[number];
/** E.g. 'linear', 'y-branch', etc. */
export type LineRouteType = (typeof LineRouteTypes)[number];
/** E.g. 'suburban-train', 'regional-train', etc. */
export type ServiceMode = (typeof ServiceModes)[number];
/** E.g. 'low', or 'high'. */
export type ConfidenceLevel = (typeof ConfidenceLevels)[number];
/** E.g. 'special-events-only' or 'hidden'. */
export type LineVisibility = (typeof LineVisibilityValues)[number];

/** Matches a value in {@link LineColors}. */
export const LineColorJson = z.enum(LineColors);
/** Matches a value in {@link LineRouteTypes}. */
export const LineRouteTypeJson = z.enum(LineRouteTypes);
/** Matches a value in {@link ServiceModes}. */
export const ServiceModeJson = z.enum(ServiceModes);
/** Matches a value in {@link ConfidenceLevels}. */
export const ConfidenceLevelJson = z.enum(ConfidenceLevels);
/** Matches a value in {@link LineVisibilityValues}. */
export const LineVisibilityJson = z.enum(LineVisibilityValues);
