import { Disruption } from "../../shared/disruptions-v2/disruption";
import {
  ProposedDisruption,
  ProposedDisruptionID,
} from "../../shared/disruptions-v2/proposed/proposed-disruption";
import { AutoDisruptionParser } from "./sources/auto-disruption-parser";

interface Input {
  readonly disruptions: Disruption[];
  readonly proposalInbox: ProposedDisruption[];
  readonly handledProposals: ProposedDisruption[];
  readonly newProposals: ProposedDisruption[];
  readonly parsers: AutoDisruptionParser[];
}

export type RequiredAction = {
  readonly addToInbox: ProposedDisruption[];
  readonly removeFromHandled: ProposedDisruptionID[];
  readonly addDisruptions: Disruption[];
  readonly deleteDisruptions: string[];
};

export function processNewProposedDisruptions(input: Input): RequiredAction {
  const actions: RequiredAction = {
    addToInbox: [],
    removeFromHandled: [],
    addDisruptions: [],
    deleteDisruptions: [],
  };

  for (const proposal of input.newProposals) {
    const handledProposal =
      input.handledProposals.find((x) => x.id.equals(proposal.id)) ?? null;

    // If the proposal is new, it should be added to the inbox and parsed.
    if (handledProposal == null) {
      actions.addToInbox.push(proposal);
      actions.addDisruptions.push(...parseDisruption(proposal, input.parsers));
    }

    // If the proposal was already handled but has since changed, it should be
    // added to the inbox again, and any automatically created disruptions
    // should be regenerated.
    if (handledProposal != null && handledProposal.hash !== proposal.hash) {
      actions.removeFromHandled.push(handledProposal.id);
      actions.addToInbox.push(proposal);

      const expired = input.disruptions
        .filter((d) => d.createdAutomatically && d.usesSource(proposal.id))
        .map((x) => x.id);
      actions.deleteDisruptions.push(...expired);
      actions.addDisruptions.push(...parseDisruption(proposal, input.parsers));
    }
  }

  // TODO: Remove handled proposals once they disappear from the input.

  return actions;
}

function parseDisruption(
  proposal: ProposedDisruption,
  parsers: AutoDisruptionParser[],
): Disruption[] {
  for (const parser of parsers) {
    const parsed = parser.process(proposal);
    if (parsed != null) {
      return parsed;
    }
  }
  return [];
}
