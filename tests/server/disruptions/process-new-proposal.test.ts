import { describe, expect, it } from "vitest";
import { processNewProposedDisruptions } from "../../../server/disruptions/process-new-proposal";
import { AutoDisruptionParser } from "../../../server/disruptions/sources/auto-disruption-parser";
import { Disruption } from "../../../shared/disruptions/disruption";
import {
  ProposedDisruption,
  ProposedDisruptionID,
} from "../../../shared/disruptions/proposed/proposed-disruption";
import { HasSharedConfig } from "../../../shared/system/config-utils";

export class DummyProposedDisruption extends ProposedDisruption {
  constructor(id: string, hash: string) {
    super(
      "test-proposed",
      new ProposedDisruptionID("test-proposed", id),
      "Test",
      null,
      null,
      hash,
    );
  }
  getMarkdown(_config: HasSharedConfig): string {
    throw new Error("Method not implemented.");
  }
}
class DummyDisruption extends Disruption {
  constructor(
    id: string,
    createdAutomatically: boolean,
    source: ProposedDisruptionID,
  ) {
    super(
      "test-dummy",
      id,
      createdAutomatically,
      [source],
      "Test Dummy Disruption",
      null,
    );
  }
}
class DummyParser extends AutoDisruptionParser {
  process(proposal: ProposedDisruption): Disruption[] | null {
    return [
      new DummyDisruption(this.generateDisruptionID(), true, proposal.id),
    ];
  }
}

describe("processNewProposedDisruptions", () => {
  it("should add new proposals to the inbox and parse them", () => {
    const input = {
      disruptions: [],
      proposalInbox: [],
      handledProposals: [],
      newProposals: [new DummyProposedDisruption("1", "hash1")],
      parsers: [new DummyParser()],
    };
    const actions = processNewProposedDisruptions(input);
    expect(actions.addToInbox.length).toBe(1);
    expect(actions.addToInbox[0].id.idAtSource).toBe("1");
    expect(actions.addDisruptions.length).toBe(1);
    expect(actions.addDisruptions[0].sources[0].idAtSource).toBe("1");

    expect(actions.removeFromHandled.length).toBe(0);
    expect(actions.deleteDisruptions.length).toBe(0);
    expect(actions.removeFromInbox.length).toBe(0);
  });

  it("should bring handled proposals back to the inbox when updated", () => {
    const input = {
      disruptions: [],
      proposalInbox: [],
      handledProposals: [new DummyProposedDisruption("1", "hash1")],
      newProposals: [new DummyProposedDisruption("1", "hash2")],
      parsers: [new DummyParser()],
    };
    const actions = processNewProposedDisruptions(input);
    expect(actions.removeFromHandled.length).toBe(1);
    expect(actions.removeFromHandled[0].idAtSource).toBe("1");
    expect(actions.addToInbox.length).toBe(1);
    expect(actions.addToInbox[0].id.idAtSource).toBe("1");
    expect(actions.addToInbox[0].hash).toBe("hash2");

    expect(actions.addDisruptions.length).toBe(1);
    expect(actions.deleteDisruptions.length).toBe(0);
    expect(actions.removeFromInbox.length).toBe(0);
  });

  it("should replace proposals in the inbox when updated", () => {
    const input = {
      disruptions: [],
      proposalInbox: [new DummyProposedDisruption("1", "hash1")],
      handledProposals: [],
      newProposals: [new DummyProposedDisruption("1", "hash2")],
      parsers: [new DummyParser()],
    };
    const actions = processNewProposedDisruptions(input);
    expect(actions.removeFromInbox.length).toBe(1);
    expect(actions.removeFromInbox[0].idAtSource).toBe("1");
    expect(actions.addToInbox.length).toBe(1);
    expect(actions.addToInbox[0].id.idAtSource).toBe("1");
    expect(actions.addToInbox[0].hash).toBe("hash2");

    expect(actions.addDisruptions.length).toBe(1);
    expect(actions.deleteDisruptions.length).toBe(0);
    expect(actions.removeFromHandled.length).toBe(0);
  });

  it("should delete all automatically generated disruptions from outdated disruptions", () => {
    const input = {
      disruptions: [
        new DummyDisruption(
          "1",
          true,
          new ProposedDisruptionID("test-proposed", "1"),
        ),
      ],
      proposalInbox: [],
      handledProposals: [new DummyProposedDisruption("1", "hash1")],
      newProposals: [new DummyProposedDisruption("1", "hash2")],
      parsers: [new DummyParser()],
    };
    const actions = processNewProposedDisruptions(input);
    expect(actions.deleteDisruptions.length).toBe(1);
    expect(actions.deleteDisruptions[0]).toBe("1");
    expect(actions.addDisruptions.length).toBe(1);
    expect(actions.addDisruptions[0].sources[0].idAtSource).toBe("1");

    expect(actions.addToInbox.length).toBe(1);
    expect(actions.removeFromHandled.length).toBe(1);
    expect(actions.removeFromInbox.length).toBe(0);
  });

  it("should do nothing if the new proposal is already handled", () => {
    const input = {
      disruptions: [
        new DummyDisruption(
          "1",
          true,
          new ProposedDisruptionID("test-proposed", "1"),
        ),
      ],
      proposalInbox: [],
      handledProposals: [new DummyProposedDisruption("1", "hash1")],
      newProposals: [new DummyProposedDisruption("1", "hash1")],
      parsers: [new DummyParser()],
    };
    const actions = processNewProposedDisruptions(input);
    expect(actions.addToInbox.length).toBe(0);
    expect(actions.addDisruptions.length).toBe(0);
    expect(actions.removeFromHandled.length).toBe(0);
    expect(actions.deleteDisruptions.length).toBe(0);
    expect(actions.removeFromInbox.length).toBe(0);
  });

  it("should do nothing if the new proposal is already in the inbox", () => {
    const input = {
      disruptions: [
        new DummyDisruption(
          "1",
          true,
          new ProposedDisruptionID("test-proposed", "1"),
        ),
      ],
      proposalInbox: [new DummyProposedDisruption("1", "hash1")],
      handledProposals: [],
      newProposals: [new DummyProposedDisruption("1", "hash1")],
      parsers: [new DummyParser()],
    };
    const actions = processNewProposedDisruptions(input);
    expect(actions.addToInbox.length).toBe(0);
    expect(actions.addDisruptions.length).toBe(0);
    expect(actions.removeFromHandled.length).toBe(0);
    expect(actions.deleteDisruptions.length).toBe(0);
    expect(actions.removeFromInbox.length).toBe(0);
  });
});
