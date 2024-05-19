import type { Disruption } from "shared/disruptions/processed/disruption";
import { GenericLineDisruptionData } from "shared/disruptions/processed/types/generic-line";
import { GenericStopDisruptionData } from "shared/disruptions/processed/types/generic-stop";

export function extractSummaryFromDisruption(disruption: Disruption) {
  if (disruption.data instanceof GenericLineDisruptionData) {
    return disruption.data.message;
  }
  if (disruption.data instanceof GenericStopDisruptionData) {
    return disruption.data.message;
  }
  throw new Error(`Unknown disruption type: ${disruption.type}`);
}
