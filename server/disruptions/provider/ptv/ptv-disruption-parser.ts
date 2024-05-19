import { ExternalDisruptionData } from "../../../../shared/disruptions/external/external-disruption-data";
import { PtvExternalDisruptionData } from "../../../../shared/disruptions/external/types/ptv";
import { DisruptionData } from "../../../../shared/disruptions/processed/disruption-data";
import { GenericLineDisruptionData } from "../../../../shared/disruptions/processed/types/generic-line";
import { GenericStopDisruptionData } from "../../../../shared/disruptions/processed/types/generic-stop";
import { AutoDisruptionParser } from "../auto-disruption-parser";

export class PtvDisruptionParser extends AutoDisruptionParser {
  process(proposal: ExternalDisruptionData): DisruptionData[] | null {
    if (!(proposal instanceof PtvExternalDisruptionData)) {
      return null;
    }

    const hasStopVibes = /^.{3,30}( line)? stations?:.{10}/gi.test(
      proposal.title,
    );

    if (proposal.affectedLines.length !== 0 && !hasStopVibes) {
      return [
        new GenericLineDisruptionData(
          proposal.title,
          proposal.affectedLines,
          proposal.starts,
          proposal.ends,
        ),
      ];
    } else if (proposal.affectedStops.length !== 0) {
      return [
        new GenericStopDisruptionData(
          proposal.title,
          proposal.affectedStops,
          proposal.starts,
          proposal.ends,
        ),
      ];
    } else {
      // It doesn't affect any stops or lines? May as well not exist!
      return [];
    }
  }
}
