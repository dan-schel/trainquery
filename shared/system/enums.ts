import { z } from "zod";

/** All line colors supported by the frontend. */
export const LineColors = ["none", "red", "yellow", "green", "cyan", "blue", "purple", "pink"] as const;
/** All supported line route types. */
export const LineRouteTypes = ["linear", "y-branch", "hook"] as const;

/** One of a list of pre-defined color options. */
export type LineColor = typeof LineColors[number];
/** E.g. 'linear', 'y-branch', etc. */
export type LineRouteType = typeof LineRouteTypes[number];

/** Matches a value in {@link LineColors}. */
export const LineColorJson = z.enum(LineColors);
/** Matches a value in {@link LineRouteTypes}. */
export const LineRouteTypeJson = z.enum(LineRouteTypes);
