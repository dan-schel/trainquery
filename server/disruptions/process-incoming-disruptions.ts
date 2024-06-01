import { uuid } from "@dan-schel/js-utils";
import { ExternalDisruption } from "../../shared/disruptions/external/external-disruption";
import { ExternalDisruptionID } from "../../shared/disruptions/external/external-disruption-id";
import { ExternalDisruptionInInbox } from "../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../shared/disruptions/external/rejected-external-disruption";
import { Disruption } from "../../shared/disruptions/processed/disruption";
import { DisruptionID, toDisruptionID } from "../../shared/system/ids";
import {
  AutoDisruptionParser,
  ParsingResults,
} from "./provider/auto-disruption-parser";
import { DisruptionData } from "../../shared/disruptions/processed/disruption-data";

interface Input {
  readonly incomingDisruptions: ExternalDisruption[];
  readonly parsers: AutoDisruptionParser[];

  readonly disruptions: Disruption[];
  readonly inbox: ExternalDisruptionInInbox[];
  readonly rejected: RejectedExternalDisruption[];
}

interface RequiredAction {
  readonly disruptions: {
    readonly add: Disruption[];
    readonly delete: DisruptionID[];
  };
  readonly inbox: {
    readonly add: ExternalDisruptionInInbox[];
    readonly delete: ExternalDisruptionID[];
  };
  readonly rejected: {
    readonly delete: ExternalDisruptionID[];
  };
}

export function processIncomingDisruptions(input: Input): RequiredAction {
  const { incomingDisruptions, parsers, disruptions, inbox, rejected } = input;
  const result: RequiredAction = {
    disruptions: {
      add: [],
      delete: [],
    },
    inbox: {
      add: [],
      delete: [],
    },
    rejected: {
      delete: [],
    },
  };

  for (const incoming of incomingDisruptions) {
    // Check whether this external disruption was rejected, and check if it's
    // content has since changed, and whether that means this disruption should
    // no longer be rejected.
    const rejection = rejected.find((r) => r.hasSameID(incoming));
    if (rejection != null) {
      if (!rejection.overturnsRejection(incoming)) {
        continue;
      } else {
        result.rejected.delete.push(rejection.id);
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
        result.disruptions.add.push(...parsed);

        // High confidence parsing avoids creating a inbox entry.
        if (!parsingResults.highConfidence) {
          const newInboxEntry = new ExternalDisruptionInInbox(incoming, parsed);
          result.inbox.add.push(newInboxEntry);
        }
      } else {
        const newInboxEntry = new ExternalDisruptionInInbox(incoming, []);
        result.inbox.add.push(newInboxEntry);
      }
    }
  }

  // TODO: Run through all disruptions, updating sources if need be.

  // Remove external disruptions that have since disappeared from the inbox and
  // rejected list.
  for (const inboxEntry of inbox) {
    const isDeleted = incomingDisruptions.every(
      (d) => !inboxEntry.hasSameID(d),
    );
    if (isDeleted) {
      result.inbox.delete.push(inboxEntry.id);
    }
  }
  for (const rejectedEntry of rejected) {
    const isDeleted = incomingDisruptions.every(
      (d) => !rejectedEntry.hasSameID(d),
    );
    if (isDeleted) {
      result.rejected.delete.push(rejectedEntry.id);
    }
  }

  return result;
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
