import { ExternalDisruption } from "../../shared/disruptions/external/external-disruption";
import { ExternalDisruptionInInbox } from "../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../shared/disruptions/external/rejected-external-disruption";
import { Disruption } from "../../shared/disruptions/processed/disruption";
import { DisruptionID, ExternalDisruptionID } from "../../shared/system/ids";
import { Transaction } from "./transaction";

interface Input {
  // Note: It's important we pass the entire external disruption object, not
  // just the ID. On the off chance the external disruption updates in the time
  // between the admin loading the "Process disruption" page and submitting the
  // rejection, only passing the ID means we reject the new version of the
  // external disruption instead of the old one the admin saw. Rejecting the old
  // one means it will still be resurfaced next time processIncomingDisruptions
  // runs.
  readonly toReject: ExternalDisruption;
  readonly resurfaceIfUpdated: boolean;

  readonly disruptions: Transaction<Disruption, DisruptionID>;
  readonly inbox: Transaction<ExternalDisruptionInInbox, ExternalDisruptionID>;
  readonly rejected: Transaction<
    RejectedExternalDisruption,
    ExternalDisruptionID
  >;
}

export function rejectDisruption(input: Input) {
  const { toReject, resurfaceIfUpdated, disruptions, inbox, rejected } = input;

  // Add the disruption to the rejected list.
  rejected.add(
    new RejectedExternalDisruption(toReject, resurfaceIfUpdated, null),
  );

  // Remove the disruption from the inbox.
  inbox.delete(toReject.id);

  // Remove any provisional/generated disruptions that use this external
  // disruption as a source.
  for (const disruption of disruptions) {
    if (
      disruption.usesSource(toReject.id) &&
      ["provisional", "generated"].includes(disruption.state)
    ) {
      disruptions.delete(disruption.id);
    }
  }
}
