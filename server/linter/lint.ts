import { ServerConfig } from "../../shared/system/config";
import { LintMessage } from "./utils";
import { lintUrlNames } from "./url-names";
import { lintStopsAndLines } from "./stops-and-lines";

export async function lint(data: ServerConfig): Promise<LintMessage[]> {
  const messages: LintMessage[] = [];

  await lintUrlNames(data, messages);
  await lintStopsAndLines(data, messages);

  return messages;
}
