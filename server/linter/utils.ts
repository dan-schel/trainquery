import { listifyAnd } from "@schel-d/js-utils";
import { ServerConfig } from "../../shared/system/config";

export type LintMessage = {
  severity: "suggestion" | "warning" | "error";
  message: string;
};

export type Linter = (data: ServerConfig, messages: LintMessage[]) => void | Promise<void>;

export function examples(items: string[], max: number) {
  if (items.length <= max) {
    return listifyAnd(items);
  }
  return `${items.slice(0, max).join(", ")} + ${items.length - max} more`;
}

export function listDuplicated<T>(items: T[], equalityFunc: (a: T, b: T) => boolean): T[] {
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
