import { listifyAnd } from "@schel-d/js-utils";

export type LintMessage = {
  severity: "suggestion" | "warning" | "error";
  message: string;
};

export function examples(items: string[], max: number) {
  if (items.length <= max) {
    return listifyAnd(items);
  }
  return `${items.slice(0, max).join(", ")} + ${items.length - max} more`;
}
