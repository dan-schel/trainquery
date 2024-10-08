import { describe, it } from "vitest";
import { processIncomingDisruptions } from "../../../server/disruptions/process-incoming-disruptions";
import { ExternalDisruption } from "../../../shared/disruptions/external/external-disruption";
import {
  AutoDisruptionParser,
  ParsingResults,
} from "../../../server/disruptions/provider/auto-disruption-parser";
import { Disruption } from "../../../shared/disruptions/processed/disruption";
import {
  toDisruptionID,
  toExternalDisruptionID,
} from "../../../shared/system/ids";
import { ExternalDisruptionInInbox } from "../../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../../shared/disruptions/external/rejected-external-disruption";
import { DisruptionData } from "../../../shared/disruptions/processed/disruption-data";
import { ExternalDisruptionData } from "../../../shared/disruptions/external/external-disruption-data";
import {
  DummyDisruptionData,
  DummyExternalDisruptionData,
  createDisruptions,
  createInbox,
  createRejected,
  expectActions,
} from "./utils";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";
import { QDate } from "../../../shared/qtime/qdate";
import { QTime } from "../../../shared/qtime/qtime";
import { QDuration } from "../../../shared/qtime/qduration";

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

const now = new QUtcDateTime(new QDate(2024, 9, 28), new QTime(10, 30, 0));
const rejectedDeleteAfter = new QDuration({ d: 7 });

function identifier(data: DisruptionData) {
  if (data instanceof DummyDisruptionData) {
    return toDisruptionID(data.id);
  }
  throw new Error();
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
      now,
      rejectedDeleteAfter,
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
      now,
      rejectedDeleteAfter,
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

  it("should remove disruptions from the inbox that disappear from incoming", () => {
    const oldDisruption = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );

    const incomingDisruptions: ExternalDisruption[] = [];
    const disruptions = createDisruptions([]);
    const inbox = createInbox([new ExternalDisruptionInInbox(oldDisruption)]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      inbox: { delete: [toExternalDisruptionID("dummy-1")] },
    });
  });

  it("it should ignore disruptions that are already processed", () => {
    const disruption1 = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );
    const disruption2 = new ExternalDisruption(
      new DummyExternalDisruptionData("2", "content", false),
    );

    const incomingDisruptions = [disruption1, disruption2];
    const disruptions = createDisruptions([
      new Disruption(
        toDisruptionID("whatever"),
        new DummyDisruptionData("idk", "content"),
        "curated",
        [disruption1],
        null,
      ),
    ]);
    const inbox = createInbox([new ExternalDisruptionInInbox(disruption2)]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {});
  });

  it("it should regenerate auto-parsed disruptions if their sources are updated", () => {
    const oldSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "old-content", false),
    );
    const newSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "new-content", false),
    );

    const incomingDisruptions = [newSource];
    const disruptions = createDisruptions([
      new Disruption(
        toDisruptionID("whatever"),
        new DummyDisruptionData("idk", "content"),
        "provisional",
        [oldSource],
        null,
      ),
    ]);
    const inbox = createInbox([new ExternalDisruptionInInbox(oldSource)]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
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
            new DummyDisruptionData("1-1", "new-content"),
            "provisional",
            [newSource],
            null,
          ),
        ],
        delete: [toDisruptionID("whatever")],
      },
      inbox: { update: [new ExternalDisruptionInInbox(newSource)] },
    });
  });

  it("it should delete auto-parsed disruptions if their sources disappear", () => {
    const oldSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "old-content", false),
    );

    const incomingDisruptions: ExternalDisruption[] = [];
    const disruptions = createDisruptions([
      new Disruption(
        toDisruptionID("whatever"),
        new DummyDisruptionData("idk", "content"),
        "provisional",
        [oldSource],
        null,
      ),
    ]);
    const inbox = createInbox([new ExternalDisruptionInInbox(oldSource)]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      disruptions: {
        delete: [toDisruptionID("whatever")],
      },
      inbox: { delete: [oldSource.id] },
    });
  });

  it("it should track source updates on manually-curated disruptions", () => {
    const oldSource1 = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "old-content", false),
    );
    const newSource1 = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "new-content", false),
    );
    const oldSource2 = new ExternalDisruption(
      new DummyExternalDisruptionData("2", "old-content", false),
    );

    const incomingDisruptions = [newSource1];
    const disruptions = createDisruptions([
      new Disruption(
        toDisruptionID("1"),
        new DummyDisruptionData("idk", "content"),
        "curated",
        [oldSource1],
        null,
      ),
      new Disruption(
        toDisruptionID("2"),
        new DummyDisruptionData("idk", "content"),
        "curated",
        [oldSource2],
        null,
      ),
    ]);
    const inbox = createInbox([]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      disruptions: {
        update: [
          new Disruption(
            toDisruptionID("1"),
            new DummyDisruptionData("idk", "content"),
            "curated",
            [oldSource1],
            [newSource1],
          ),
          new Disruption(
            toDisruptionID("2"),
            new DummyDisruptionData("idk", "content"),
            "curated",
            [oldSource2],
            [],
          ),
        ],
      },
    });
  });

  it("it should delete auto-delete disruptions when all sources disappear", () => {
    const oldSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );
    const incomingDisruptions: ExternalDisruption[] = [];
    const disruptions = createDisruptions([
      new Disruption(
        toDisruptionID("1"),
        new DummyDisruptionData("idk", "content"),
        "curated-auto-delete",
        [oldSource],
        null,
      ),
    ]);
    const inbox = createInbox([]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      disruptions: {
        delete: [toDisruptionID("1")],
      },
    });
  });

  it("it should retain auto-delete disruptions if some sources persist", () => {
    const oldSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );
    const currentSource = new ExternalDisruption(
      new DummyExternalDisruptionData("2", "content", false),
    );

    const incomingDisruptions = [currentSource];
    const disruptions = createDisruptions([
      new Disruption(
        toDisruptionID("1"),
        new DummyDisruptionData("idk", "content"),
        "curated-auto-delete",
        [oldSource, currentSource],
        null,
      ),
    ]);
    const inbox = createInbox([]);
    const rejected = createRejected([]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      disruptions: {
        update: [
          new Disruption(
            toDisruptionID("1"),
            new DummyDisruptionData("idk", "content"),
            "curated-auto-delete",
            [oldSource, currentSource],
            [currentSource],
          ),
        ],
      },
    });
  });

  it("it should ignore rejected disruptions", () => {
    const incoming = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );

    const incomingDisruptions = [incoming];
    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([
      new RejectedExternalDisruption(incoming, true, null),
    ]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {});
  });

  it("it should resurface rejected disruptions if they're updated", () => {
    const oldSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "old-content", false),
    );
    const newSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "new-content", false),
    );

    const incomingDisruptions = [newSource];
    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([
      new RejectedExternalDisruption(oldSource, true, null),
    ]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
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
            new DummyDisruptionData("1-1", "new-content"),
            "provisional",
            [newSource],
            null,
          ),
        ],
      },
      inbox: { add: [new ExternalDisruptionInInbox(newSource)] },
      rejected: {
        delete: [oldSource.id],
      },
    });
  });

  it("it should ignore updated disruptions if they're permanently rejected", () => {
    const oldSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "old-content", false),
    );
    const newSource = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "new-content", false),
    );

    const incomingDisruptions = [newSource];
    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([
      new RejectedExternalDisruption(oldSource, false, null),
    ]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {});
  });

  it("should schedule rejected disruptions for deletion when they disappear from incoming", () => {
    const oldDisruption = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );

    const incomingDisruptions: ExternalDisruption[] = [];
    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([
      new RejectedExternalDisruption(oldDisruption, false, null),
    ]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      rejected: {
        update: [
          new RejectedExternalDisruption(
            oldDisruption,
            false,
            new QUtcDateTime(new QDate(2024, 10, 5), new QTime(10, 30, 0)),
          ),
        ],
      },
    });
  });

  it("should cancel deletion of rejected disruptions if they reappear", () => {
    const returningDisruption = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );

    const incomingDisruptions: ExternalDisruption[] = [returningDisruption];
    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([
      new RejectedExternalDisruption(
        returningDisruption,
        false,
        new QUtcDateTime(new QDate(2024, 9, 29), new QTime(10, 39, 0)),
      ),
    ]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      rejected: {
        update: [
          new RejectedExternalDisruption(returningDisruption, false, null),
        ],
      },
    });
  });

  it("should delete rejected disruptions when the scheduled time arrives", () => {
    const oldDisruption = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );

    const incomingDisruptions: ExternalDisruption[] = [];
    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([
      new RejectedExternalDisruption(
        oldDisruption,
        false,
        new QUtcDateTime(new QDate(2024, 9, 27), new QTime(10, 41, 0)),
      ),
    ]);

    processIncomingDisruptions({
      incomingDisruptions,
      parsers,
      now,
      rejectedDeleteAfter,
      disruptions,
      inbox,
      rejected,
      identifier,
    });

    expectActions(disruptions, inbox, rejected, {
      rejected: {
        delete: [oldDisruption.id],
      },
    });
  });
});
