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

interface Input {
  readonly incomingDisruptions: ExternalDisruption[];
  readonly parsers: AutoDisruptionParser[];

  readonly disruptions: Transaction<Disruption, DisruptionID>;
  readonly inbox: Transaction<ExternalDisruptionInInbox, ExternalDisruptionID>;
  readonly rejected: Transaction<
    RejectedExternalDisruption,
    ExternalDisruptionID
  >;
}

export function processIncomingDisruptions(input: Input) {
  const { incomingDisruptions, parsers, disruptions, inbox, rejected } = input;

  // Run through all disruptions, updating sources if need be.
  for (const disruption of disruptions) {
    const updatedSources = incomingDisruptions.filter((d) =>
      disruption.usesSource(d),
    );
    if (arraysMatch(updatedSources, disruption.sources, identicalMatcher)) {
      continue;
    }

    if (disruption.state === "approved" || disruption.state === "curated") {
      disruptions.update(disruption.with({ updatedSources }));
    } else {
      disruptions.delete(disruption.id);
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
    const usedAsSource = disruptions.some((d) => d.usesSource(incoming));
    if (!foundInInbox && !usedAsSource) {
      const parsingResults = parseDisruption(incoming, parsers);
      if (parsingResults != null) {
        const parsed = parsingResults.disruptions.map((d) =>
          newDisruption(d, incoming, parsingResults.highConfidence),
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

  // Remove external disruptions that have since disappeared from the inbox and
  // rejected list.
  for (const inboxEntry of inbox) {
    const isDeleted = incomingDisruptions.every(
      (d) => !inboxEntry.hasSameID(d),
    );
    if (isDeleted) {
      inbox.delete(inboxEntry.id);
    }
  }
  for (const rejectedEntry of rejected) {
    const isDeleted = incomingDisruptions.every(
      (d) => !rejectedEntry.hasSameID(d),
    );
    if (isDeleted) {
      rejected.delete(rejectedEntry.id);
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
) {
  const id = toDisruptionID(uuid());
  const state = highConfidence ? "generated" : "provisional";
  return new Disruption(id, data, state, [source], null);
}

function identicalMatcher(a: ExternalDisruption, b: ExternalDisruption) {
  return a.isIdenticalTo(b);
}
