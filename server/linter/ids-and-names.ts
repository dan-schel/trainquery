import { ServerConfig } from "../../shared/system/config";
import { LintMessage, examples, listDuplicated } from "./utils";

export function lintUniqueIDs(data: ServerConfig, messages: LintMessage[]) {
  const duplicatedStopIDs = listDuplicated(
    data.shared.stops.map((s) => s.id),
    (a, b) => a == b
  );
  const duplicatedLineIDs = listDuplicated(
    data.shared.lines.map((s) => s.id),
    (a, b) => a == b
  );

  if (duplicatedStopIDs.length > 0) {
    messages.push({
      severity: "error",
      message: `${examples(
        duplicatedStopIDs.map((s) => s.toFixed()),
        3
      )} ${
        duplicatedStopIDs.length == 1
          ? "is used as a stop ID"
          : "are used as stop IDs"
      } more than once.`,
    });
  }
  if (duplicatedLineIDs.length > 0) {
    messages.push({
      severity: "error",
      message: `${examples(
        duplicatedLineIDs.map((s) => s.toFixed()),
        3
      )} ${
        duplicatedLineIDs.length == 1
          ? "is used as a line ID"
          : "are used as line IDs"
      } more than once.`,
    });
  }
}

export function lintUniqueNames(data: ServerConfig, messages: LintMessage[]) {
  const duplicatedStopNames = listDuplicated(
    data.shared.stops.map((s) => s.name),
    (a, b) => a == b
  );
  const duplicatedLineNames = listDuplicated(
    data.shared.lines.map((s) => s.name),
    (a, b) => a == b
  );

  if (duplicatedStopNames.length > 0) {
    messages.push({
      severity: "error",
      message: `There are multiple stops named ${examples(
        duplicatedStopNames.map((s) => `"${s}"`),
        3
      )}.`,
    });
  }
  if (duplicatedLineNames.length > 0) {
    messages.push({
      severity: "error",
      message: `There are multiple lines named ${examples(
        duplicatedLineNames.map((l) => `"${l}"`),
        3
      )}.`,
    });
  }
}

export function lintStopAndLineNames(
  data: ServerConfig,
  messages: LintMessage[]
) {
  const stopRegex = data.server.linter.stopNameRegex;
  const lineRegex = data.server.linter.lineNameRegex;
  const failingStops = data.shared.stops.filter((s) => !stopRegex.test(s.name));
  const failingLines = data.shared.lines.filter((l) => !lineRegex.test(l.name));

  if (failingStops.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(
        failingStops.map((s) => `"${s.name}"`),
        3
      )} ${
        failingStops.length == 1 ? "breaks" : "break"
      } the stop naming rule given to the linter.`,
    });
  }

  if (failingLines.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(
        failingLines.map((s) => `"${s.name}"`),
        3
      )} ${
        failingLines.length == 1 ? "breaks" : "break"
      } the line naming rule given to the linter.`,
    });
  }
}
