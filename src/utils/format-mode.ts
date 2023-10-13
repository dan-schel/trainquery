import type { ServiceTypeID } from "shared/system/ids";
import { requireServiceType } from "shared/system/config-utils";
import { getConfig } from "./get-config";

export function formatMode(
  serviceType: ServiceTypeID,
  {
    plural = false,
    line = false,
    capital = false,
  }: { plural?: boolean; line?: boolean; capital?: boolean } = {}
): string {
  const suffix = plural
    ? line
      ? "train lines"
      : "trains"
    : line
    ? "train line"
    : "train";

  return {
    "suburban-train": capital ? `Suburban ${suffix}` : `suburban ${suffix}`,
    "regional-train": capital ? `Regional ${suffix}` : `regional ${suffix}`,
  }[requireServiceType(getConfig(), serviceType).mode];
}
