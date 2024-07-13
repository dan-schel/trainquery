import { getConfig } from "@/utils/get-config";
import { listifyAnd } from "@dan-schel/js-utils";
import { PtvExternalDisruptionData } from "shared/disruptions/external/types/ptv";
import type { Disruption } from "shared/disruptions/processed/disruption";
import { GenericLineDisruptionData } from "shared/disruptions/processed/types/generic-line";
import { GenericStopDisruptionData } from "shared/disruptions/processed/types/generic-stop";
import { requireLine, requireStop } from "shared/system/config-utils";

export type FormattedDisruption = {
  type: string;
  summary: string;
  impact: string | null;
};

export function formatDisruption(disruption: Disruption): FormattedDisruption {
  return {
    type: formatDisruptionType(disruption),
    summary: formatDisruptionSummary(disruption),
    impact: formatDisruptionImpact(disruption),
  };
}

// TODO: Replace these functions with a "Formatter" object per disruption type?

function formatDisruptionType(disruption: Disruption) {
  const type = {
    "generic-line": "Generic Line",
    "generic-stop": "Generic Stop",
  }[disruption.type];

  // TODO: Ideally we use some Typescript agic to make this a compile-time error
  // not a runtime error.
  if (type == null) {
    throw new Error(`Unknown disruption type: ${disruption.type}`);
  }
  return type;
}

function formatDisruptionSummary(disruption: Disruption) {
  if (disruption.data instanceof GenericLineDisruptionData) {
    return disruption.data.message;
  }
  if (disruption.data instanceof GenericStopDisruptionData) {
    return disruption.data.message;
  }

  // TODO: Ideally we use some Typescript agic to make this a compile-time error
  // not a runtime error.
  throw new Error(`Unknown disruption type: ${disruption.type}`);
}

function formatDisruptionImpact(disruption: Disruption) {
  if (disruption.data instanceof GenericLineDisruptionData) {
    const lineNames = disruption.data.affectedLines.map(
      (x) => requireLine(getConfig(), x).name,
    );
    const listed = listifyAnd(lineNames);
    return lineNames.length === 1 ? `${listed} Line` : `${listed} lines`;
  }
  if (disruption.data instanceof GenericStopDisruptionData) {
    const stopNames = disruption.data.affectedStops.map(
      (x) => requireStop(getConfig(), x).name,
    );
    const listed = listifyAnd(stopNames);
    return stopNames.length === 1 ? `${listed} Station` : `${listed} stations`;
  }

  // TODO: Ideally we use some Typescript agic to make this a compile-time error
  // not a runtime error.
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
