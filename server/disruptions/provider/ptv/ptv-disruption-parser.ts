import { ExternalDisruptionData } from "../../../../shared/disruptions/external/external-disruption-data";
import { PtvExternalDisruptionData } from "../../../../shared/disruptions/external/types/ptv";
import { GenericLineDisruptionData } from "../../../../shared/disruptions/processed/types/generic-line";
import { GenericStopDisruptionData } from "../../../../shared/disruptions/processed/types/generic-stop";
import {
  AutoDisruptionParser,
  ParsingResults,
  withLowConfidence,
} from "../auto-disruption-parser";

export class PtvDisruptionParser extends AutoDisruptionParser {
  process(input: ExternalDisruptionData): ParsingResults | null {
    if (!(input instanceof PtvExternalDisruptionData)) {
      return null;
    }

    const hasStopVibes = /^.{3,30}( line)? stations?:.{10}/gi.test(input.title);

    if (input.affectedLines.length !== 0 && !hasStopVibes) {
      return withLowConfidence([
        new GenericLineDisruptionData(
          input.title,
          input.affectedLines,
          input.starts,
          input.ends,
        ),
      ]);
    } else if (input.affectedStops.length !== 0) {
      return withLowConfidence([
        new GenericStopDisruptionData(
          input.title,
          input.affectedStops,
          input.starts,
          input.ends,
        ),
      ]);
    } else {
      // It doesn't affect any stops or lines? May as well not exist!
      return withLowConfidence([]);
    }
  }
}
