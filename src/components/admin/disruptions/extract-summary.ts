import { listifyAnd } from "@dan-schel/js-utils";
import type { ExternalDisruption } from "shared/disruptions/external/external-disruption";
import { PtvExternalDisruptionData } from "shared/disruptions/external/types/ptv";
import { formatDateTime } from "shared/qtime/format";
import { toLocalDateTimeLuxon } from "shared/qtime/luxon-conversions";
import {
  requireLine,
  requireStop,
  type HasSharedConfig,
} from "shared/system/config-utils";

export function extractSummaryFromDisruption(disruption: ExternalDisruption) {
  if (disruption.data instanceof PtvExternalDisruptionData) {
    return disruption.data.title;
  }
  throw new Error(`Unknown external disruption type: ${disruption.type}`);
}

export function disruptionToMarkdown(
  config: HasSharedConfig,
  disruption: ExternalDisruption,
) {
  if (disruption.data instanceof PtvExternalDisruptionData) {
    return ptvDisruptionToMarkdown(config, disruption.data);
  }
  throw new Error(`Unknown external disruption type: ${disruption.type}`);
}

export function ptvDisruptionToMarkdown(
  config: HasSharedConfig,
  disruption: PtvExternalDisruptionData,
) {
  const keyValue: Record<string, string> = {
    "PTV ID": disruption.id.toFixed(),
    URL:
      disruption.url != null ? `[${disruption.url}](${disruption.url})` : "N/A",
    "Affected lines":
      disruption.affectedLines.length !== 0
        ? listifyAnd(
            disruption.affectedLines.map((x) => requireLine(config, x).name),
          )
        : "N/A",
    "Affected stops":
      disruption.affectedStops.length !== 0
        ? listifyAnd(
            disruption.affectedStops.map((x) => requireStop(config, x).name),
          )
        : "N/A",
    Starts:
      disruption.starts != null
        ? formatDateTime(toLocalDateTimeLuxon(config, disruption.starts), {
            includeYear: true,
          })
        : "N/A",
    Ends:
      disruption.ends != null
        ? formatDateTime(toLocalDateTimeLuxon(config, disruption.ends), {
            includeYear: true,
          })
        : "N/A",
  };

  return `
    # ${disruption.title}
    ${disruption.description}
    ${Object.keys(keyValue)
      .map((x) => `**${x}**: ${keyValue[x]}`)
      .join("\n")}
    `;
}
