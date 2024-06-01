import { ExternalDisruptionData } from "../../../shared/disruptions/external/external-disruption-data";
import { DisruptionData } from "../../../shared/disruptions/processed/disruption-data";

export type ParsingResults = {
  disruptions: DisruptionData[];
  highConfidence: boolean;
};

export abstract class AutoDisruptionParser {
  /**
   * Returns null if this parser doesn't know how to parse the external data,
   * or an array of parsed DisruptionData objects if it does.
   * @param input The disruption data pulled from an external API.
   */
  abstract process(input: ExternalDisruptionData): ParsingResults | null;
}

export function withHighConfidence(
  disruptions: DisruptionData[],
): ParsingResults {
  return {
    disruptions,
    highConfidence: true,
  };
}

export function withLowConfidence(
  disruptions: DisruptionData[],
): ParsingResults {
  return {
    disruptions,
    highConfidence: false,
  };
}
