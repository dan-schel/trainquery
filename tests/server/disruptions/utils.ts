import { expect } from "vitest";
import { Disruption } from "../../../shared/disruptions/processed/disruption";
import {
  DisruptionID,
  ExternalDisruptionID,
  toExternalDisruptionID,
} from "../../../shared/system/ids";
import { ExternalDisruptionInInbox } from "../../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../../shared/disruptions/external/rejected-external-disruption";
import { DisruptionData } from "../../../shared/disruptions/processed/disruption-data";
import { Transaction } from "../../../server/disruptions/transaction";
import { ExternalDisruptionData } from "../../../shared/disruptions/external/external-disruption-data";
import { QUtcDateTime } from "../../../shared/qtime/qdatetime";

export class DummyExternalDisruptionData extends ExternalDisruptionData {
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
export class DummyDisruptionData extends DisruptionData {
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

export function createDisruptions(disruptions: Disruption[]) {
  return new Transaction(disruptions, (x) => x.id);
}
export function createInbox(disruptions: ExternalDisruptionInInbox[]) {
  return new Transaction(disruptions, (x) => x.id);
}
export function createRejected(disruptions: RejectedExternalDisruption[]) {
  return new Transaction(disruptions, (x) => x.id);
}

export function expectActions(
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
  expect(disruptions.getActions()).toEqual({
    add: actions.disruptions?.add ?? [],
    update: actions.disruptions?.update ?? [],
    delete: actions.disruptions?.delete ?? [],
  });
  expect(inbox.getActions()).toEqual({
    add: actions.inbox?.add ?? [],
    update: actions.inbox?.update ?? [],
    delete: actions.inbox?.delete ?? [],
  });
  expect(rejected.getActions()).toEqual({
    add: actions.rejected?.add ?? [],
    update: actions.rejected?.update ?? [],
    delete: actions.rejected?.delete ?? [],
  });
}
