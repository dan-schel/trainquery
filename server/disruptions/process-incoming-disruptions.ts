import { arraysMatch, uuid } from "@dan-schel/js-utils";
import { ExternalDisruption } from "../../shared/disruptions/external/external-disruption";
import { ExternalDisruptionInInbox } from "../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../shared/disruptions/external/rejected-external-disruption";
import { Disruption } from "../../shared/disruptions/processed/disruption";
import {
  DisruptionID,
  ExternalDisruptionID,
  toDisruptionID,
} from "../../shared/system/ids";
import {
  AutoDisruptionParser,
  ParsingResults,
} from "./provider/auto-disruption-parser";
import { DisruptionData } from "../../shared/disruptions/processed/disruption-data";
import { Transaction } from "./transaction";
import { QUtcDateTime } from "../../shared/qtime/qdatetime";
import { QDuration } from "../../shared/qtime/qduration";

interface Input {
  readonly incomingDisruptions: ExternalDisruption[];
  readonly parsers: AutoDisruptionParser[];
  readonly now: QUtcDateTime;
  readonly rejectedDeleteAfter: QDuration;

  readonly disruptions: Transaction<Disruption, DisruptionID>;
  readonly inbox: Transaction<ExternalDisruptionInInbox, ExternalDisruptionID>;
  readonly rejected: Transaction<
    RejectedExternalDisruption,
    ExternalDisruptionID
  >;

  readonly identifier?: (data: DisruptionData) => DisruptionID;
}

const deletionStrategies = {
  provisional: "on-any-source-update",
  generated: "on-any-source-update",
  "approved-auto-delete": "on-all-sources-removed",
  "curated-auto-delete": "on-all-sources-removed",
  approved: "never",
  curated: "never",
} as const;

export function processIncomingDisruptions(input: Input) {
  const {
    incomingDisruptions,
    parsers,
    disruptions,
    inbox,
    rejected,
    now,
    rejectedDeleteAfter,
  } = input;

  // Run through all disruptions, updating sources if need be.
  for (const disruption of disruptions) {
    const updatedSources = incomingDisruptions.filter((d) =>
      disruption.usesSource(d.id),
    );
    if (arraysMatch(updatedSources, disruption.sources, identicalMatcher)) {
      continue;
    }

    const deletionStrategy = deletionStrategies[disruption.state];
    if (deletionStrategy === "on-any-source-update") {
      disruptions.delete(disruption.id);
    } else if (
      deletionStrategy === "on-all-sources-removed" &&
      updatedSources.length === 0
    ) {
      disruptions.delete(disruption.id);
    } else {
      disruptions.update(disruption.with({ updatedSources }));
    }
  }

  // Remove external disruptions that have since disappeared from the inbox.
  for (const inboxEntry of inbox) {
    // Delete inbox entries even when updated, so the below code can re-generate
    // disruptions for it.
    const isDeleted = incomingDisruptions.every(
      (d) => !inboxEntry.disruption.isIdenticalTo(d),
    );
    if (isDeleted) {
      inbox.delete(inboxEntry.id);
    }
  }

  // Schedule rejected external disruptions for deletion if they are no longer
  // present in the incoming disruptions, and cancel the schedules if they
  // reappear. Delete any that are now past their deletion date.
  for (const rejectedEntry of rejected) {
    const isDeleted = incomingDisruptions.every(
      (d) => !rejectedEntry.hasSameID(d),
    );
    if (isDeleted) {
      if (rejectedEntry.deleteAt == null) {
        rejected.update(
          rejectedEntry.withDeletionScheduled(now.add(rejectedDeleteAfter)),
        );
      } else if (now.isAfter(rejectedEntry.deleteAt)) {
        // TODO: Move cleanup logic to a separate job.
        rejected.delete(rejectedEntry.id);
      }
    } else if (rejectedEntry.deleteAt != null) {
      // If the external disruption is still present, cancel the deletion.
      rejected.update(rejectedEntry.withDeletionCancelled());
    }
  }

  for (const incoming of incomingDisruptions) {
    // Check whether this external disruption was rejected, and check if it's
    // content has since changed, and whether that means this disruption should
    // no longer be rejected.
    const rejection = rejected.find((r) => r.hasSameID(incoming));
    if (rejection != null) {
      if (!rejection.overturnsRejection(incoming)) {
        continue;
      } else {
        rejected.delete(rejection.id);
      }
    }

    // Check the incoming disruptions isn't already handled, and otherwise add
    // it to the inbox.
    const foundInInbox = inbox.some((i) => i.hasSameID(incoming));
    const usedAsSource = disruptions.some((d) => d.usesSource(incoming.id));
    if (!foundInInbox && !usedAsSource) {
      const parsingResults = parseDisruption(incoming, parsers);
      if (parsingResults != null) {
        const parsed = parsingResults.disruptions.map((d) =>
          newDisruption(
            d,
            incoming,
            parsingResults.highConfidence,
            input.identifier ?? randomIdentifier,
          ),
        );
        disruptions.add(...parsed);
      }

      // If it wasn't parsed, or parsed with low confidence, sent it to the
      // inbox for human processing.
      if (parsingResults?.highConfidence !== true) {
        const newInboxEntry = new ExternalDisruptionInInbox(incoming);
        inbox.add(newInboxEntry);
      }
    }
  }
}

function parseDisruption(
  source: ExternalDisruption,
  parsers: AutoDisruptionParser[],
): ParsingResults | null {
  for (const parser of parsers) {
    const parsed = parser.process(source.data);
    if (parsed != null) {
      return parsed;
    }
  }
  return null;
}

function newDisruption(
  data: DisruptionData,
  source: ExternalDisruption,
  highConfidence: boolean,
  identifier: (data: DisruptionData) => DisruptionID,
) {
  const id = identifier(data);
  const state = highConfidence ? "generated" : "provisional";
  return new Disruption(id, data, state, [source], null);
}

function identicalMatcher(a: ExternalDisruption, b: ExternalDisruption) {
  return a.isIdenticalTo(b);
}

function randomIdentifier(_data: DisruptionData): DisruptionID {
  return toDisruptionID(uuid());
}
