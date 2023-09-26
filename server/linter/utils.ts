import { listifyAnd } from "@schel-d/js-utils";
import { ServerConfig } from "../config/server-config";

export type LintMessage = {
  severity: LintSeverity;
  message: string;
};
export type LintSeverity = "suggestion" | "warning" | "error";

export type Linter = (ctx: LintContext) => void | Promise<void>;

export class LintContext {
  private readonly _messages: LintMessage[] = [];
  constructor(private readonly _data: ServerConfig) {}

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

  logSuggestion(message: string) {
    this._messages.push({ severity: "suggestion", message: message });
  }
  logWarning(message: string) {
    this._messages.push({ severity: "warning", message: message });
  }
  logError(message: string) {
    this._messages.push({ severity: "error", message: message });
  }

  private logPluralized(
    severity: LintSeverity,
    ...params: Parameters<typeof pluralize>
  ) {
    const quantifier = params[0];
    if (typeof quantifier == "number") {
      if (quantifier == 0) {
        return;
      }
    } else {
      if (quantifier.length == 0) {
        return;
      }
    }
    this._messages.push({ severity: severity, message: pluralize(...params) });
  }

  /** Uses {@link pluralize} to build message. Does nothing if item count is 0. */
  logPluralizedSuggestion(...params: Parameters<typeof pluralize>) {
    this.logPluralized("suggestion", ...params);
  }
  /** Uses {@link pluralize} to build message. Does nothing if item count is 0. */
  logPluralizedWarning(...params: Parameters<typeof pluralize>) {
    this.logPluralized("warning", ...params);
  }
  /** Uses {@link pluralize} to build message. Does nothing if item count is 0. */
  logPluralizedError(...params: Parameters<typeof pluralize>) {
    this.logPluralized("error", ...params);
  }
}

export function examplify(items: string[], max: number) {
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
