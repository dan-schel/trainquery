import { ServerConfig } from "../../shared/system/config";
import { LintMessage } from "./utils";
import { lintUrlNames } from "./url-names";

export async function lint(data: ServerConfig): Promise<LintMessage[]> {
  return [...(await lintUrlNames(data))];
}
