import { ServerConfig } from "../../shared/system/config";
import { LintMessage, examples } from "./utils";

export function lintStopsAndLines(data: ServerConfig, messages: LintMessage[]) {
  const stopRegex = data.server.linter.stopNameRegex;
  const lineRegex = data.server.linter.lineNameRegex;
  const failingStops = data.shared.stops.filter(s => !stopRegex.test(s.name));
  const failingLines = data.shared.lines.filter(l => !lineRegex.test(l.name));

  if (failingStops.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(failingStops.map((s) => s.name), 3)} break the stop naming rule given to the linter.`,
    });
  }

  if (failingLines.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(failingLines.map((s) => s.name), 3)} break the line naming rule given to the linter.`,
    });
  }
}
