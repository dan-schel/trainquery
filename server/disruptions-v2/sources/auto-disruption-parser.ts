import { uuid } from "@dan-schel/js-utils";
import { Disruption } from "../../../shared/disruptions-v2/disruption";
import { ProposedDisruption } from "../../../shared/disruptions-v2/proposed/proposed-disruption";

export abstract class AutoDisruptionParser {
  /**
   * Returns null if this parser doesn't know how to parse the proposal,
   * or an array of parsed Disruptions if it does.
   * @param proposal The proposed disruption provided by an external API.
   */
  abstract process(proposal: ProposedDisruption): Disruption[] | null;

  protected generateDisruptionID() {
    return uuid();
  }
}
