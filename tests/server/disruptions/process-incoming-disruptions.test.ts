import { describe, expect, it } from "vitest";
import { processIncomingDisruptions } from "../../../server/disruptions/process-incoming-disruptions";
import { ExternalDisruption } from "../../../shared/disruptions/external/external-disruption";
import {
  AutoDisruptionParser,
  ParsingResults,
} from "../../../server/disruptions/provider/auto-disruption-parser";
import { Disruption } from "../../../shared/disruptions/processed/disruption";
import {
  DisruptionID,
  ExternalDisruptionID,
  toDisruptionID,
  toExternalDisruptionID,
} from "../../../shared/system/ids";
import { ExternalDisruptionInInbox } from "../../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../../shared/disruptions/external/rejected-external-disruption";
import { DisruptionData } from "../../../shared/disruptions/processed/disruption-data";
import { Transaction } from "../../../server/disruptions/transaction";
import { ExternalDisruptionData } from "../../../shared/disruptions/external/external-disruption-data";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";

class DummyExternalDisruptionData extends ExternalDisruptionData {
  constructor(
    readonly id: string,
    readonly content: string,
    readonly highConfidenceParsing: boolean,
  ) {
    super();
  }
  getID(): ExternalDisruptionID {
    return toExternalDisruptionID(`dummy-${this.id}`);
  }
  getType(): string {
    return "dummy";
  }
  getStarts(): QUtcDateTime | null {
    throw new Error("Method not implemented.");
  }
  getEnds(): QUtcDateTime | null {
    throw new Error("Method not implemented.");
  }
  matchesContent(other: ExternalDisruptionData): boolean {
    if (other instanceof DummyExternalDisruptionData) {
      return this.content === other.content;
    }
    return false;
  }
}
class DummyDisruptionData extends DisruptionData {
  constructor(
    readonly id: string,
    readonly content: string,
  ) {
    super();
  }
  getType(): string {
    return "dummy";
  }
}
class DummyDisruptionParser extends AutoDisruptionParser {
  process(input: ExternalDisruptionData): ParsingResults | null {
    if (input instanceof DummyExternalDisruptionData) {
      return {
        disruptions: [new DummyDisruptionData(`${input.id}-1`, input.content)],
        highConfidence: input.highConfidenceParsing,
      };
    }
    return null;
  }
}

const parsers = [new DummyDisruptionParser()];
function createDisruptions(disruptions: Disruption[]) {
  return new Transaction(disruptions, (x) => x.id);
}
function createInbox(disruptions: ExternalDisruption[]) {
  return new Transaction(
    disruptions.map((x) => new ExternalDisruptionInInbox(x)),
    (x) => x.id,
  );
}
function createRejected(disruptions: RejectedExternalDisruption[]) {
  return new Transaction(disruptions, (x) => x.id);
}
function identifier(data: DisruptionData) {
  if (data instanceof DummyDisruptionData) {
    return toDisruptionID(data.id);
  }
  throw new Error();
}

function expectActions(
  disruptions: Transaction<Disruption, DisruptionID>,
  inbox: Transaction<ExternalDisruptionInInbox, ExternalDisruptionID>,
  rejected: Transaction<RejectedExternalDisruption, ExternalDisruptionID>,
  actions: {
    disruptions?: {
      add?: Disruption[];
      update?: Disruption[];
      delete?: DisruptionID[];
    };
    inbox?: {
      add?: ExternalDisruptionInInbox[];
      update?: ExternalDisruptionInInbox[];
      delete?: ExternalDisruptionID[];
    };
    rejected?: {
      add?: RejectedExternalDisruption[];
      update?: RejectedExternalDisruption[];
      delete?: ExternalDisruptionID[];
    };
  },
) {
  expect(disruptions.actions).toEqual({
    add: actions.disruptions?.add ?? [],
    update: actions.disruptions?.update ?? [],
    delete: actions.disruptions?.delete ?? [],
  });
  expect(inbox.actions).toEqual({
    add: actions.inbox?.add ?? [],
    update: actions.inbox?.update ?? [],
    delete: actions.inbox?.delete ?? [],
  });
  expect(rejected.actions).toEqual({
    add: actions.rejected?.add ?? [],
    update: actions.rejected?.update ?? [],
    delete: actions.rejected?.delete ?? [],
  });
}

describe("processIncomingDisruptions", () => {
  it("should parse unseen disruptions and add them to the inbox", () => {
    const incomingDisruption = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );
    const incomingDisruptions = [incomingDisruption];

    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      disruptions: {
        add: [
          new Disruption(
            toDisruptionID("1-1"),
            new DummyDisruptionData("1-1", "content"),
            "provisional",
            [incomingDisruption],
            null,
          ),
        ],
      },
      inbox: { add: [new ExternalDisruptionInInbox(incomingDisruption)] },
    });
  });

  it("should have disruption parsed with confidence skip the inbox", () => {
    const incomingDisruption = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", true),
    );
    const incomingDisruptions = [incomingDisruption];

    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      disruptions: {
        add: [
          new Disruption(
            toDisruptionID("1-1"),
            new DummyDisruptionData("1-1", "content"),
            "generated",
            [incomingDisruption],
            null,
          ),
        ],
      },
    });
  });
});
