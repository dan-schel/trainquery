import { LintContext, examples, listDuplicated } from "./utils";

export function lintUniqueIDs(ctx: LintContext) {
  const duplicatedStopIDs = listDuplicated(
    ctx.shared.stops.map((s) => s.id),
    (a, b) => a == b
  );
  const duplicatedLineIDs = listDuplicated(
    ctx.shared.lines.map((s) => s.id),
    (a, b) => a == b
  );

  if (duplicatedStopIDs.length > 0) {
    ctx.throw(
      `${examples(
        duplicatedStopIDs.map((s) => s.toFixed()),
        3
      )} ${
        duplicatedStopIDs.length == 1
          ? "is used as a stop ID"
          : "are used as stop IDs"
      } more than once.`
    );
  }
  if (duplicatedLineIDs.length > 0) {
    ctx.throw(
      `${examples(
        duplicatedLineIDs.map((s) => s.toFixed()),
        3
      )} ${
        duplicatedLineIDs.length == 1
          ? "is used as a line ID"
          : "are used as line IDs"
      } more than once.`
    );
  }
}

export function lintUniqueNames(ctx: LintContext) {
  const duplicatedStopNames = listDuplicated(
    ctx.shared.stops.map((s) => s.name),
    (a, b) => a == b
  );
  const duplicatedLineNames = listDuplicated(
    ctx.shared.lines.map((s) => s.name),
    (a, b) => a == b
  );

  if (duplicatedStopNames.length > 0) {
    ctx.throw(
      `There are multiple stops named ${examples(
        duplicatedStopNames.map((s) => `"${s}"`),
        3
      )}.`
    );
  }
  if (duplicatedLineNames.length > 0) {
    ctx.throw(
      `There are multiple lines named ${examples(
        duplicatedLineNames.map((l) => `"${l}"`),
        3
      )}.`
    );
  }
}

export function lintStopAndLineNames(ctx: LintContext) {
  const stopRegex = ctx.server.linter.stopNameRegex;
  const lineRegex = ctx.server.linter.lineNameRegex;
  const failingStops = ctx.shared.stops.filter((s) => !stopRegex.test(s.name));
  const failingLines = ctx.shared.lines.filter((l) => !lineRegex.test(l.name));

  if (failingStops.length > 0) {
    ctx.warn(
      `${examples(
        failingStops.map((s) => `"${s.name}"`),
        3
      )} ${
        failingStops.length == 1 ? "breaks" : "break"
      } the stop naming rule given to the linter.`
    );
  }

  if (failingLines.length > 0) {
    ctx.warn(
      `${examples(
        failingLines.map((s) => `"${s.name}"`),
        3
      )} ${
        failingLines.length == 1 ? "breaks" : "break"
      } the line naming rule given to the linter.`
    );
  }
}
