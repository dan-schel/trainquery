import type { ServiceTypeID } from "shared/system/ids";
import { requireServiceType } from "shared/system/config-utils";
import { getConfig } from "./get-config";

export function getServiceTypeModeString(
  serviceType: ServiceTypeID,
  options?: { plural: boolean }
): string {
  return {
    "suburban-train":
      options?.plural ?? false ? "Suburban train lines" : "Suburban train line",
    "regional-train":
      options?.plural ?? false ? "Regional train lines" : "Regional train line",
  }[requireServiceType(getConfig(), serviceType).mode];
}
