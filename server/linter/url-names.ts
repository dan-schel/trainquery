import { ServerConfig } from "../../shared/system/config";
import { LintMessage, examples } from "./utils";

export function lintMissingUrlNames(
  data: ServerConfig,
  messages: LintMessage[]
) {
  const stopsWithoutUrls = data.shared.stops.filter(
    (s) => data.shared.urlNames.stops.get(s.id) == null
  );
  const linesWithoutUrls = data.shared.lines.filter(
    (l) => data.shared.urlNames.lines.get(l.id) == null
  );

  if (stopsWithoutUrls.length > 0) {
    messages.push({
      severity: "warning",
      message: `Missing stop URL ${
        stopsWithoutUrls.length == 1 ? "name" : "names"
      } for ${examples(
        stopsWithoutUrls.map((s) => s.name),
        3
      )}.`,
    });
  }

  if (linesWithoutUrls.length > 0) {
    messages.push({
      severity: "warning",
      message: `Missing line URL ${
        linesWithoutUrls.length == 1 ? "name" : "names"
      } for ${examples(
        linesWithoutUrls.map((l) => l.name),
        3
      )}.`,
    });
  }
}

export function lintUrlNameSimilarity(
  data: ServerConfig,
  messages: LintMessage[]
) {
  const oddStopUrlNames = data.shared.stops.filter(
    (s) =>
      s.name.toLowerCase().replace(/ /g, "") !=
      data.shared.urlNames.stops.get(s.id)
  );
  const oddLineUrlNames = data.shared.lines.filter(
    (l) =>
      l.name.toLowerCase().replace(/ /g, "") !=
      data.shared.urlNames.lines.get(l.id)
  );

  if (oddStopUrlNames.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(
        oddStopUrlNames.map(
          (s) => `${s.name} (${data.shared.urlNames.stops.get(s.id)})`
        ),
        3
      )} ${
        oddStopUrlNames.length == 1
          ? "has an unconventional URL, given its name"
          : "have unconventional URLs, given their names"
      }.`,
    });
  }
  if (oddLineUrlNames.length > 0) {
    messages.push({
      severity: "warning",
      message: `${examples(
        oddLineUrlNames.map(
          (l) => `${l.name} (${data.shared.urlNames.lines.get(l.id)})`
        ),
        3
      )} ${
        oddLineUrlNames.length == 1
          ? "has an unconventional URL, given its name"
          : "have unconventional URLs, given their names"
      }.`,
    });
  }
}

export function lintUrlNamesAgainstRegex(
  data: ServerConfig,
  messages: LintMessage[]
) {
  const urlNameRegex = /^[a-z]+$/;
  const badStops = Array.from(data.shared.urlNames.stops.values()).filter(
    (n) => !urlNameRegex.test(n)
  );
  const badLines = Array.from(data.shared.urlNames.lines.values()).filter(
    (n) => !urlNameRegex.test(n)
  );

  if (badStops.length > 0) {
    messages.push({
      severity: "error",
      message: `${examples(
        badStops.map((n) => `"${n}"`),
        3
      )} ${
        badStops.length == 1 ? "contains" : "contain"
      } illegal characters for a stop URL.`,
    });
  }
  if (badLines.length > 0) {
    messages.push({
      severity: "error",
      message: `${examples(
        badLines.map((n) => `"${n}"`),
        3
      )} ${
        badLines.length == 1 ? "contains" : "contain"
      } illegal characters for a line URL.`,
    });
  }
}
