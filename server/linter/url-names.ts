import { LintContext, examples } from "./utils";

export function lintMissingUrlNames(ctx: LintContext) {
  const stopsWithoutUrls = ctx.shared.stops.filter(
    (s) => ctx.shared.urlNames.stops.get(s.id) == null
  );
  const linesWithoutUrls = ctx.shared.lines.filter(
    (l) => ctx.shared.urlNames.lines.get(l.id) == null
  );

  if (stopsWithoutUrls.length > 0) {
    ctx.warn(
      `Missing stop URL ${
        stopsWithoutUrls.length == 1 ? "name" : "names"
      } for ${examples(
        stopsWithoutUrls.map((s) => s.name),
        3
      )}.`
    );
  }

  if (linesWithoutUrls.length > 0) {
    ctx.warn(
      `Missing line URL ${
        linesWithoutUrls.length == 1 ? "name" : "names"
      } for ${examples(
        linesWithoutUrls.map((l) => l.name),
        3
      )}.`
    );
  }
}

export function lintUrlNameSimilarity(ctx: LintContext) {
  const oddStopUrlNames = ctx.shared.stops.filter(
    (s) =>
      s.name.toLowerCase().replace(/ /g, "") !=
      ctx.shared.urlNames.stops.get(s.id)
  );
  const oddLineUrlNames = ctx.shared.lines.filter(
    (l) =>
      l.name.toLowerCase().replace(/ /g, "") !=
      ctx.shared.urlNames.lines.get(l.id)
  );

  if (oddStopUrlNames.length > 0) {
    ctx.warn(
      `${examples(
        oddStopUrlNames.map(
          (s) => `${s.name} (${ctx.shared.urlNames.stops.get(s.id)})`
        ),
        3
      )} ${
        oddStopUrlNames.length == 1
          ? "has an unconventional URL, given its name"
          : "have unconventional URLs, given their names"
      }.`
    );
  }
  if (oddLineUrlNames.length > 0) {
    ctx.warn(
      `${examples(
        oddLineUrlNames.map(
          (l) => `${l.name} (${ctx.shared.urlNames.lines.get(l.id)})`
        ),
        3
      )} ${
        oddLineUrlNames.length == 1
          ? "has an unconventional URL, given its name"
          : "have unconventional URLs, given their names"
      }.`
    );
  }
}

export function lintUrlNamesAgainstRegex(ctx: LintContext) {
  const urlNameRegex = /^[a-z]+$/;
  const badStops = Array.from(ctx.shared.urlNames.stops.values()).filter(
    (n) => !urlNameRegex.test(n)
  );
  const badLines = Array.from(ctx.shared.urlNames.lines.values()).filter(
    (n) => !urlNameRegex.test(n)
  );

  if (badStops.length > 0) {
    ctx.throw(
      `${examples(
        badStops.map((n) => `"${n}"`),
        3
      )} ${
        badStops.length == 1 ? "contains" : "contain"
      } illegal characters for a stop URL.`
    );
  }
  if (badLines.length > 0) {
    ctx.throw(
      `${examples(
        badLines.map((n) => `"${n}"`),
        3
      )} ${
        badLines.length == 1 ? "contains" : "contain"
      } illegal characters for a line URL.`
    );
  }
}
