import { ServerConfig } from "../../shared/system/config";
import { LintContext, LintMessage, Linter } from "./utils";
import {
  lintMissingUrlNames,
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
  ];

  for (const rule of rules) {
    await rule(ctx);
  }

  return ctx.getMessages();
}
