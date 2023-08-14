import { ServerConfig } from "../../shared/system/config";
import { LintMessage, examples } from "./utils";

export function lintUrlNames(data: ServerConfig, messages: LintMessage[]) {
  const stopsWithoutUrls = data.shared.stops.filter(
    (s) => data.shared.urlNames.stops.get(s.id) == null
  );
  const linesWithoutUrls = data.shared.lines.filter(
    (l) => data.shared.urlNames.lines.get(l.id) == null
  );

  if (stopsWithoutUrls.length > 0) {
    messages.push({
      severity: "warning",
      message: `Missing stop URL ${stopsWithoutUrls.length == 1 ? "name" : "names"
        } for ${examples(
          stopsWithoutUrls.map((s) => s.name),
          3
        )}.`,
    });
  }

  if (linesWithoutUrls.length > 0) {
    messages.push({
      severity: "warning",
      message: `Missing line URL ${linesWithoutUrls.length == 1 ? "name" : "names"
        } for ${examples(
          linesWithoutUrls.map((l) => l.name),
          3
        )}.`,
    });
  }
}
