import { PtvExternalDisruptionData } from "shared/disruptions/external/types/ptv";
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

// <TEMPORARY>
// TODO: Disruptions will one-day have their own page where they can show off
// all their information, including sources. This function that extracts the
// link from the first source is just a way to match pre-existing behaviour
// that surfaces the PTV link until that page is created.
export function extractUrlForDisruption(disruption: Disruption) {
  if (disruption.sources.length === 0) {
    return null;
  }

  const firstSource = disruption.sources[0].data;
  if (firstSource instanceof PtvExternalDisruptionData) {
    return firstSource.url;
  }
  return null;
}
// </TEMPORARY>
