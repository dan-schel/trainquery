import { ServerConfig } from "../../shared/system/config";
import { LintMessage, Linter } from "./utils";
import { lintMissingUrlNames, lintUrlNameSimilarity } from "./url-names";
import { lintStopAndLineNames, lintUniqueIDs } from "./ids-and-names";
import { lintMissingLineStops, lintOrphanStops } from "./line-stops";

export async function lint(data: ServerConfig): Promise<LintMessage[]> {
  const messages: LintMessage[] = [];

  const rules: Linter[] = [
    lintMissingUrlNames, lintUniqueIDs, lintStopAndLineNames, lintUrlNameSimilarity, lintOrphanStops, lintMissingLineStops
  ];

  for (const rule of rules) {
    await rule(data, messages);
  }

  return messages;
}
