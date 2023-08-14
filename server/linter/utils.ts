import { listifyAnd } from "@schel-d/js-utils";
import { ServerConfig } from "../../shared/system/config";

export type LintMessage = {
  severity: "suggestion" | "warning" | "error";
  message: string;
};

export type Linter = (ctx: LintContext) => void | Promise<void>;

export class LintContext {
  private readonly _messages: LintMessage[] = [];
  constructor(private readonly _data: ServerConfig) {
    this._data = _data;
  }

  get frontend() {
    return this._data.frontend;
  }
  get server() {
    return this._data.server;
  }
  get shared() {
    return this._data.shared;
  }
  get hash() {
    return this._data.hash;
  }

  getMessages() {
    return this._messages;
  }

  suggest(message: string) {
    this._messages.push({ severity: "suggestion", message: message });
  }
  warn(message: string) {
    this._messages.push({ severity: "warning", message: message });
  }
  throw(message: string) {
    this._messages.push({ severity: "error", message: message });
  }
}

export function examples(items: string[], max: number) {
  if (items.length <= max) {
    return listifyAnd(items);
  }
  return `${items.slice(0, max).join(", ")} + ${items.length - max} more`;
}

export function listDuplicated<T>(
  items: T[],
  equalityFunc: (a: T, b: T) => boolean
): T[] {
  const duplicated = new Set<T>();

  for (let i = 0; i < items.length - 1; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (equalityFunc(items[i], items[j])) {
        duplicated.add(items[i]);
      }
    }
  }

  return Array.from(duplicated);
}

export function pluralize<T extends string[]>(
  quantifier: number | any[],
  singular: (...data: T) => string,
  plural: (...data: T) => string,
  ...data: T
) {
  const count = typeof quantifier == "number" ? quantifier : quantifier.length;

  if (count == 1) {
    return singular(...data);
  }
  return plural(...data);
}
