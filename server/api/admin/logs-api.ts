import { parseIntNull } from "@dan-schel/js-utils";
import { AdminLogger } from "../../ctx/admin-logger";
import { ServerParams, TrainQuery } from "../../ctx/trainquery";
import { BadApiCallError, requireIntegerParam } from "../../param-utils";

export async function logsApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  await ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  if (!(ctx.logger instanceof AdminLogger)) {
    throw new BadApiCallError(
      "This TrainQuery instance doesn't use an AdminLogger.",
    );
  }

  // TODO: This is ugly. Refactor ServerParams to be a class you can call
  // methods on instead of the requireParam() functions, and add new methods
  // that allow for default values & params that aren't required.
  const instance = params.query["instance"] ?? ctx.instanceID;

  // TODO: This is ugly too.
  let beforeSequence: number | null = null;
  if (params.query["beforeSequence"] != null) {
    beforeSequence = parseIntNull(params.query["beforeSequence"]);
    if (beforeSequence == null || beforeSequence < 0) {
      throw new BadApiCallError(
        '"beforeSequence" param, if provided, must be a positive integer.',
      );
    }
  }

  const count = requireIntegerParam(params, "count");
  if (count < 1 || count > 100) {
    throw new BadApiCallError('"count" param must be between 1 and 100.');
  }

  return {
    logWindow: await ctx.logger.getWindow(ctx, instance, beforeSequence, count),
    availableInstances: await ctx.logger.getAvailableInstances(ctx),
  };
}
