import { Disruption } from "./disruption";

export function parseDisruption(json: unknown): Disruption<string> {}

export function serializeDisruption(disruption: Disruption<string>): unknown {}
