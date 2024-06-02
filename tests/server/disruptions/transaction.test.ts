import { describe, expect, it } from "vitest";
import { Transaction } from "../../../server/disruptions/transaction";
import { parseIntThrow } from "@dan-schel/js-utils";

export function identify(value: string) {
  return parseIntThrow(value.split("-")[0]);
}

function expectActions(
  transaction: Transaction<string, number>,
  actions: { add?: string[]; update?: string[]; delete?: number[] },
) {
  expect(transaction.actions).toEqual({
    add: actions.add ?? [],
    update: actions.update ?? [],
    delete: actions.delete ?? [],
  });
}

describe("Transaction", () => {
  describe("add", () => {
    it("should add a single item", () => {
      const transaction = new Transaction(["0-001"], identify);
      transaction.add("1-001");
      expect(transaction.value).toEqual(["0-001", "1-001"]);
      expectActions(transaction, { add: ["1-001"] });
    });

    it("should throw for duplicated IDs", () => {
      const transaction = new Transaction(["0-001"], identify);
      expect(() => transaction.add("0-002")).toThrow();
    });

    it("should handle deleted items being re-added", () => {
      const transaction = new Transaction(["0-001"], identify);
      transaction.delete(0);
      transaction.add("0-001");
      expect(transaction.value).toEqual(["0-001"]);

      // It's not smart enough to know that the value didn't actually change.
      expectActions(transaction, { update: ["0-001"] });
    });
  });

  describe("delete", () => {
    it("should delete a single item", () => {
      const transaction = new Transaction(["0-001"], identify);
      transaction.delete(0);
      expect(transaction.value).toEqual([]);
      expectActions(transaction, { delete: [0] });
    });

    it("should throw for missing IDs", () => {
      const transaction = new Transaction([], identify);
      expect(() => transaction.delete(0)).toThrow();
    });

    it("should handle added items being re-deleted", () => {
      const transaction = new Transaction([], identify);
      transaction.add("0-001");
      transaction.delete(0);
      expect(transaction.value).toEqual([]);
      expectActions(transaction, {});
    });
  });

  describe("update", () => {
    it("should update a single item", () => {
      const transaction = new Transaction(["0-001"], identify);
      transaction.update("0-002");
      expect(transaction.value).toEqual(["0-002"]);
      expectActions(transaction, { update: ["0-002"] });
    });

    it("should update new items correctly", () => {
      const transaction = new Transaction([], identify);
      transaction.add("0-001");
      transaction.update("0-002");
      expect(transaction.value).toEqual(["0-002"]);
      expectActions(transaction, { add: ["0-002"] });
    });

    it("should throw for missing IDs", () => {
      const transaction = new Transaction([], identify);
      expect(() => transaction.update("0-001")).toThrow();
    });

    it("should be overridden by deletes", () => {
      const transaction = new Transaction(["0-001"], identify);
      transaction.update("0-002");
      transaction.delete(0);
      expect(transaction.value).toEqual([]);
      expectActions(transaction, { delete: [0] });
    });
  });

  describe("constructor", () => {
    it("should prevent duplicate IDs", () => {
      expect(() => new Transaction(["0-001", "0-002"], identify)).toThrow();
    });
  });

  describe("iterator", () => {
    it("should allow deleting while iterating", () => {
      const transaction = new Transaction(["0-001", "1-001"], identify);
      const iterator = transaction[Symbol.iterator]();
      expect(iterator.next().value).toBe("0-001");
      transaction.delete(0);
      expect(iterator.next().value).toBe("1-001");
    });

    it("should allow deleting while iterating", () => {
      const startValues = ["0-001", "1-002", "2-002", "3-001", "4-002"];
      const transaction = new Transaction(startValues, identify);
      for (const value of transaction) {
        if (value.endsWith("2")) {
          transaction.delete(identify(value));
        }
      }
      expect(transaction.value).toEqual(["0-001", "3-001"]);
      expectActions(transaction, { delete: [1, 2, 4] });
    });
  });
});
