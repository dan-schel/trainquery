import { ServerConfig } from "../../shared/system/config";
import { LintMessage, examples } from "./utils";

export function lintMissingUrlNames(data: ServerConfig, messages: LintMessage[]) {
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

export function lintUrlNameSimilarity(data: ServerConfig, messages: LintMessage[]) {
  const oddStopUrlNames = data.shared.stops.filter(s => s.name.toLowerCase().replace(" ", "") != data.shared.urlNames.stops.get(s.id));
  const oddLineUrlNames = data.shared.lines.filter(l => l.name.toLowerCase().replace(" ", "") != data.shared.urlNames.lines.get(l.id));

  if (oddStopUrlNames.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(oddStopUrlNames.map(s => `${s.name} (${data.shared.urlNames.stops.get(s.id)})`), 3)} ${oddStopUrlNames.length == 1 ? "has an unconventional URL, given its name" : "have unconventional URLs, given their names"}.`,
    });
  }
  if (oddLineUrlNames.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(oddLineUrlNames.map(l => `${l.name} (${data.shared.urlNames.lines.get(l.id)})`), 3)} ${oddLineUrlNames.length == 1 ? "has an unconventional URL, given its name" : "have unconventional URLs, given their names"}.`,
    });
  }
}
