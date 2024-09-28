import {
  DummyDisruptionData,
  DummyExternalDisruptionData,
  createDisruptions,
  createInbox,
  createRejected,
  expectActions,
} from "./utils";
import { describe, expect, it } from "vitest";
import { rejectDisruption } from "../../../server/disruptions/reject-disruption";
import { ExternalDisruption } from "../../../shared/disruptions/external/external-disruption";
import { Disruption } from "../../../shared/disruptions/processed/disruption";
import { toDisruptionID } from "../../../shared/system/ids";
import { ExternalDisruptionInInbox } from "../../../shared/disruptions/external/external-disruption-in-inbox";
import { RejectedExternalDisruption } from "../../../shared/disruptions/external/rejected-external-disruption";

describe("rejectDisruption", () => {
  it("should move the input disruption from the inbox to rejected", () => {
    const toReject = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );

    const disruptions = createDisruptions([]);
    const inbox = createInbox([new ExternalDisruptionInInbox(toReject)]);
    const rejected = createRejected([]);

    rejectDisruption({
      toReject,
      resurfaceIfUpdated: false,
      disruptions,
      inbox,
      rejected,
    });

    expectActions(disruptions, inbox, rejected, {
      inbox: {
        delete: [toReject.id],
      },
      rejected: {
        add: [new RejectedExternalDisruption(toReject, false, null)],
      },
    });
  });

  it("should respect the given choice for resurfacing", () => {
    const toReject = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );

    const disruptions = createDisruptions([]);
    const inbox = createInbox([new ExternalDisruptionInInbox(toReject)]);
    const rejected = createRejected([]);

    rejectDisruption({
      toReject,
      resurfaceIfUpdated: true,
      disruptions,
      inbox,
      rejected,
    });

    expectActions(disruptions, inbox, rejected, {
      inbox: {
        delete: [toReject.id],
      },
      rejected: {
        add: [new RejectedExternalDisruption(toReject, true, null)],
      },
    });
  });

  it("should delete auto-parsed disruptions generated from it", () => {
    const toReject = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );
    const somethingElse = new ExternalDisruption(
      new DummyExternalDisruptionData("2", "content", false),
    );

    const disruptions = createDisruptions([
      new Disruption(
        toDisruptionID("1"),
        new DummyDisruptionData("1", "content"),
        "provisional",
        [toReject],
        null,
      ),
      new Disruption(
        toDisruptionID("2"),
        new DummyDisruptionData("1", "content"),
        "provisional",
        [somethingElse, toReject],
        null,
      ),
      new Disruption(
        toDisruptionID("3"),
        new DummyDisruptionData("1", "content"),
        "provisional",
        [somethingElse],
        null,
      ),
    ]);
    const inbox = createInbox([new ExternalDisruptionInInbox(toReject)]);
    const rejected = createRejected([]);

    rejectDisruption({
      toReject,
      resurfaceIfUpdated: false,
      disruptions,
      inbox,
      rejected,
    });

    expectActions(disruptions, inbox, rejected, {
      inbox: {
        delete: [toReject.id],
      },
      rejected: {
        add: [new RejectedExternalDisruption(toReject, false, null)],
      },
      disruptions: {
        delete: [toDisruptionID("1"), toDisruptionID("2")],
      },
    });
  });

  it("should throw if the disruption wasn't in the inbox", () => {
    const toReject = new ExternalDisruption(
      new DummyExternalDisruptionData("1", "content", false),
    );

    const disruptions = createDisruptions([]);
    const inbox = createInbox([]);
    const rejected = createRejected([]);

    expect(() =>
      rejectDisruption({
        toReject,
        resurfaceIfUpdated: false,
        disruptions,
        inbox,
        rejected,
      }),
    ).toThrow();
  });
});
