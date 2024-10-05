import { AdminLogger } from "../../ctx/admin-logger";
import { BadApiCallError } from "../../param-utils";
import { handle } from "../api-handler";
import { logsApi } from "../../../shared/api/admin/logs-api";

export const logsApiHandler = handle(
  logsApi,
  async (ctx, { instance: desiredInstance, beforeSequence, count }) => {
    if (!(ctx.logger instanceof AdminLogger)) {
      throw new BadApiCallError(
        "This TrainQuery instance doesn't use an AdminLogger.",
      );
    }

    const instance = desiredInstance ?? ctx.instanceID;

    if (beforeSequence != null && beforeSequence < 0) {
      throw new BadApiCallError(
        '"beforeSequence" param, if provided, must be a positive integer.',
      );
    }

    if (count < 1 || count > 100) {
      throw new BadApiCallError('"count" param must be between 1 and 100.');
    }

    return {
      logWindow: await ctx.logger.getWindow(
        ctx,
        instance,
        beforeSequence,
        count,
      ),
      availableInstances: await ctx.logger.getAvailableInstances(ctx),
    };
  },
);
