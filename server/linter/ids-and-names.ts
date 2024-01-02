import { LintContext, examplify, listDuplicated } from "./utils";

export function lintUniqueIDs(ctx: LintContext) {
  const duplicatedStopIDs = listDuplicated(
    ctx.shared.stops.map((s) => s.id),
    (a, b) => a === b,
  ).map((s) => s.toFixed());
  const duplicatedLineIDs = listDuplicated(
    ctx.shared.lines.map((s) => s.id),
    (a, b) => a === b,
  ).map((l) => l.toFixed());

  ctx.logPluralizedError(
    duplicatedStopIDs,
    (a) => `${a} is used as a stop ID more than once.`,
    (a) => `${a} are used as stop IDs more than once.`,
    examplify(duplicatedStopIDs, 3),
  );
  ctx.logPluralizedError(
    duplicatedLineIDs,
    (a) => `${a} is used as a stop ID more than once.`,
    (a) => `${a} are used as stop IDs more than once.`,
    examplify(duplicatedLineIDs, 3),
  );
}

export function lintUniqueNames(ctx: LintContext) {
  const duplicatedStopNames = listDuplicated(
    ctx.shared.stops.map((s) => s.name),
    (a, b) => a === b,
  ).map((s) => `"${s}"`);
  const duplicatedLineNames = listDuplicated(
    ctx.shared.lines.map((s) => s.name),
    (a, b) => a === b,
  ).map((l) => `"${l}"`);

  if (duplicatedStopNames.length > 0) {
    const examples = examplify(duplicatedStopNames, 3);
    ctx.logError(`There are multiple stops named ${examples}.`);
  }
  if (duplicatedLineNames.length > 0) {
    const examples = examplify(duplicatedLineNames, 3);
    ctx.logError(`There are multiple lines named ${examples}.`);
  }
}

export function lintStopAndLineNames(ctx: LintContext) {
  const stopRegex = ctx.server.linter.stopNameRegex;
  const lineRegex = ctx.server.linter.lineNameRegex;
  const failingStops = ctx.shared.stops
    .filter((s) => !stopRegex.test(s.name))
    .map((s) => `"${s.name}"`);
  const failingLines = ctx.shared.lines
    .filter((l) => !lineRegex.test(l.name))
    .map((l) => `"${l.name}"`);

  ctx.logPluralizedWarning(
    failingStops,
    (a) => `${a} does not follow the stop naming convention.`,
    (a) => `${a} do not follow the stop naming convention.`,
    examplify(failingStops, 3),
  );

  ctx.logPluralizedWarning(
    failingLines,
    (a) => `${a} does not follow the line naming convention.`,
    (a) => `${a} do not follow the line naming convention.`,
    examplify(failingLines, 3),
  );
}
