import { ExternalDisruptionInInbox } from "../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../shared/disruptions/external/rejected-external-disruption";
import { Disruption } from "../../shared/disruptions/processed/disruption";
import { DisruptionID, ExternalDisruptionID } from "../../shared/system/ids";
import { Transaction } from "./transaction";

interface Input {
  readonly disruption: ExternalDisruptionID;

  readonly disruptions: Transaction<Disruption, DisruptionID>;
  readonly inbox: Transaction<ExternalDisruptionInInbox, ExternalDisruptionID>;
  readonly rejected: Transaction<
    RejectedExternalDisruption,
    ExternalDisruptionID
  >;
}

export function restoreDisruption(input: Input) {
  const { disruption, rejected } = input;

  // Add the disruption to the rejected list.
  rejected.delete(disruption);

  // TODO: In future, this function should handle recreating the auto-parsed
  // disruptions and inbox entry.
  // (See comment at DisruptionsManager.restoreDisruption for more details.)
}
