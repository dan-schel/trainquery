import { Disruption } from "../../../../shared/disruptions/disruption";
import { ProposedDisruption } from "../../../../shared/disruptions/proposed/proposed-disruption";
import { PtvProposedDisruption } from "../../../../shared/disruptions/proposed/types/ptv-proposed-disruption";
import { GenericLineDisruption } from "../../../../shared/disruptions/types/generic-line-disruption";
import { GenericStopDisruption } from "../../../../shared/disruptions/types/generic-stop-disruption";
import { AutoDisruptionParser } from "../auto-disruption-parser";

export class PtvDisruptionParser extends AutoDisruptionParser {
  process(proposal: ProposedDisruption): Disruption[] | null {
    if (!(proposal instanceof PtvProposedDisruption)) {
      return null;
    }

    const hasStopVibes = /^.{3,30}( line)? stations?:.{10}/gi.test(
      proposal.title,
    );

    if (proposal.affectedLines.length !== 0 && !hasStopVibes) {
      return [
        new GenericLineDisruption(
          this.generateDisruptionID(),
          true,
          [proposal.id],
          proposal.url,
          proposal.title,
          proposal.affectedLines,
          proposal.starts,
          proposal.ends,
        ),
      ];
    } else if (proposal.affectedStops.length !== 0) {
      return [
        new GenericStopDisruption(
          this.generateDisruptionID(),
          true,
          [proposal.id],
          proposal.url,
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
