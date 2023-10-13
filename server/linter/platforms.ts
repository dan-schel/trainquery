import { LintContext, examplify } from "./utils";

export function lintPlatforms(ctx: LintContext) {
  if (ctx.shared.usePlatforms) {
    const stopsWithoutPlatforms = ctx.shared.stops
      .filter((s) => s.platforms.length == 0)
      .map((s) => s.name);

    ctx.logPluralizedError(
      stopsWithoutPlatforms,
      (a) => `${a} does not list platforms.`,
      (a) => `${a} do not list platform.`,
      examplify(stopsWithoutPlatforms, 3)
    );
  } else {
    const stopsWithPlatforms = ctx.shared.stops
      .filter((s) => s.platforms.length != 0)
      .map((s) => s.name);

    ctx.logPluralizedError(
      stopsWithPlatforms,
      (a) => `${a} lists platforms.`,
      (a) => `${a} list platforms.`,
      examplify(stopsWithPlatforms, 3)
    );
  }
}
