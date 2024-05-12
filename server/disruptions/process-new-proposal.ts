import { Disruption } from "../../shared/disruptions/disruption";
import {
  ProposedDisruption,
  ProposedDisruptionID,
} from "../../shared/disruptions/proposed/proposed-disruption";
import { AutoDisruptionParser } from "./sources/auto-disruption-parser";

interface Input {
  readonly disruptions: Disruption[];
  readonly proposalInbox: ProposedDisruption[];
  readonly handledProposals: ProposedDisruption[];

  // TODO: This name is misleading. It's the whole raw disruption feed, not just
  // the new ones!
  readonly newProposals: ProposedDisruption[];

  readonly parsers: AutoDisruptionParser[];
}

export type RequiredAction = {
  // TODO: Consider restructuring these to inbox.add and inbox.remove instead of
  // addToInbox and removeFromInbox.

  readonly addToInbox: ProposedDisruption[];
  readonly removeFromInbox: ProposedDisruptionID[];
  readonly removeFromHandled: ProposedDisruptionID[];
  readonly addDisruptions: Disruption[];
  readonly deleteDisruptions: string[];
};

export function processNewProposedDisruptions(input: Input): RequiredAction {
  const actions: RequiredAction = {
    addToInbox: [],
    removeFromInbox: [],
    removeFromHandled: [],
    addDisruptions: [],
    deleteDisruptions: [],
  };

  for (const proposal of input.newProposals) {
    const existing = findExistingProposal(
      proposal,
      input.handledProposals,
      input.proposalInbox,
    );

    // If we haven't seen this proposal before, it should be added to the inbox
    // and parsed automatically if possible.
    if (existing == null) {
      actions.addToInbox.push(proposal);
      actions.addDisruptions.push(...parseDisruption(proposal, input.parsers));
    }

    // If this is a proposal we've seen before, but it's been updated, we should
    // regenerate any automatically created disruptions and make sure it's sent
    // back to the inbox (if it has already handled).
    if (existing != null && proposal.hash !== existing.proposal.hash) {
      const expired = input.disruptions
        .filter((d) => d.createdAutomatically && d.usesSource(proposal.id))
        .map((x) => x.id);
      actions.deleteDisruptions.push(...expired);
      actions.addDisruptions.push(...parseDisruption(proposal, input.parsers));

      if (existing.isHandled) {
        actions.removeFromHandled.push(existing.proposal.id);
      } else {
        actions.removeFromInbox.push(existing.proposal.id);
      }
      actions.addToInbox.push(proposal);
    }
  }

  // TODO: Remove proposals from the inbox or handled list once they disappear
  // from the input feed.

  return actions;
}

function findExistingProposal(
  proposal: ProposedDisruption,
  handledProposals: ProposedDisruption[],
  proposalInbox: ProposedDisruption[],
) {
  const handledProposal =
    handledProposals.find((x) => x.id.equals(proposal.id)) ?? null;
  if (handledProposal != null) {
    return {
      proposal: handledProposal,
      isHandled: true,
    };
  }

  const proposalInInbox =
    proposalInbox.find((x) => x.id.equals(proposal.id)) ?? null;
  if (proposalInInbox != null) {
    return {
      proposal: proposalInInbox,
      isHandled: false,
    };
  }

  return null;
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
