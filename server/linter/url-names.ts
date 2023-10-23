import { nonNull } from "@schel-d/js-utils";
import { LintContext, examplify, listDuplicated } from "./utils";

export function lintMissingUrlNames(ctx: LintContext) {
  const stopsWithoutUrls = ctx.shared.stops
    .filter((s) => ctx.shared.urlNames.stops.get(s.id) == null)
    .map((s) => s.name);
  const linesWithoutUrls = ctx.shared.lines
    .filter((l) => ctx.shared.urlNames.lines.get(l.id) == null)
    .map((l) => l.name);

  ctx.logPluralizedWarning(
    stopsWithoutUrls,
    (a) => `Missing stop URL name for ${a}.`,
    (a) => `Missing stop URL names for ${a}.`,
    examplify(stopsWithoutUrls, 3),
  );
  ctx.logPluralizedWarning(
    linesWithoutUrls,
    (a) => `Missing line URL name for ${a}.`,
    (a) => `Missing line URL names for ${a}.`,
    examplify(linesWithoutUrls, 3),
  );
}

export function lintUrlNameSimilarity(ctx: LintContext) {
  const oddStopUrlNames = ctx.shared.stops
    .filter((s) => {
      const urlName = ctx.shared.urlNames.stops.get(s.id);
      if (urlName == null) {
        return false;
      }
      return urlName != s.name.toLowerCase().replace(/ /g, "");
    })
    .map((s) => `${s.name} (${ctx.shared.urlNames.stops.get(s.id)})`);
  const oddLineUrlNames = ctx.shared.lines
    .filter((l) => {
      const urlName = ctx.shared.urlNames.lines.get(l.id);
      if (urlName == null) {
        return false;
      }
      return urlName != l.name.toLowerCase().replace(/ /g, "");
    })
    .map((l) => `${l.name} (${ctx.shared.urlNames.lines.get(l.id)})`);

  ctx.logPluralizedWarning(
    oddStopUrlNames,
    (a) => `${a} has an unconventional URL, given the stop's name.`,
    (a) => `${a} have unconventional URLs, given each stop's name.`,
    examplify(oddStopUrlNames, 3),
  );
  ctx.logPluralizedWarning(
    oddLineUrlNames,
    (a) => `${a} has an unconventional URL, given the line's name.`,
    (a) => `${a} have unconventional URLs, given each line's name.`,
    examplify(oddLineUrlNames, 3),
  );
}

export function lintUrlNamesAgainstRegex(ctx: LintContext) {
  const urlNameRegex = /^[a-z]+$/;
  const badStops = Array.from(ctx.shared.urlNames.stops.values())
    .filter((n) => !urlNameRegex.test(n))
    .map((n) => `"${n}"`);
  const badLines = Array.from(ctx.shared.urlNames.lines.values())
    .filter((n) => !urlNameRegex.test(n))
    .map((n) => `"${n}"`);

  ctx.logPluralizedError(
    badStops,
    (a) => `${a} contains illegal characters for a stop URL.`,
    (a) => `${a} contain illegal characters for stop URLs.`,
    examplify(badStops, 3),
  );
  ctx.logPluralizedError(
    badLines,
    (a) => `${a} contains illegal characters for a line URL.`,
    (a) => `${a} contain illegal characters for line URLs.`,
    examplify(badLines, 3),
  );
}

export function lintUniqueUrlNames(ctx: LintContext) {
  const duplicatedStopUrls = listDuplicated(
    ctx.shared.stops
      .map((s) => ctx.shared.urlNames.stops.get(s.id) ?? null)
      .filter(nonNull),
    (a, b) => a == b,
  ).map((s) => `"${s}"`);
  const duplicatedLineUrls = listDuplicated(
    ctx.shared.lines
      .map((l) => ctx.shared.urlNames.lines.get(l.id) ?? null)
      .filter(nonNull),
    (a, b) => a == b,
  ).map((l) => `"${l}"`);

  ctx.logPluralizedError(
    duplicatedStopUrls,
    (a) => `Multiple stops use the stop URL ${a}`,
    (a) => `Multiple stops use the stop URLs ${a}`,
    examplify(duplicatedStopUrls, 3),
  );
  ctx.logPluralizedError(
    duplicatedLineUrls,
    (a) => `Multiple lines use the stop URL ${a}`,
    (a) => `Multiple lines use the stop URLs ${a}`,
    examplify(duplicatedLineUrls, 3),
  );
}
