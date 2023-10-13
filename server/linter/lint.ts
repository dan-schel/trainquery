import { LintContext, LintMessage, Linter } from "./utils";
import {
  lintMissingUrlNames,
  lintUniqueUrlNames,
  lintUrlNameSimilarity,
  lintUrlNamesAgainstRegex,
} from "./url-names";
import { lintStopAndLineNames, lintUniqueIDs } from "./ids-and-names";
import {
  lintLineServiceTypes,
  lintMissingLineStops,
  lintOrphanStops,
} from "./line-stops";
import { lintPlatforms } from "./platforms";
import { ServerConfig } from "../config/server-config";

export async function lint(data: ServerConfig): Promise<LintMessage[]> {
  const ctx = new LintContext(data);

  const rules: Linter[] = [
    lintMissingUrlNames,
    lintUniqueIDs,
    lintStopAndLineNames,
    lintUrlNameSimilarity,
    lintOrphanStops,
    lintMissingLineStops,
    lintUrlNamesAgainstRegex,
    lintPlatforms,
    lintLineServiceTypes,
    lintUniqueUrlNames,
  ];

  for (const rule of rules) {
    await rule(ctx);
  }

  return ctx.getMessages();
}
