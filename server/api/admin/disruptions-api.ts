import { BadApiCallError } from "../../param-utils";
import { handle } from "../api-handler";
import {
  disruptionInboxApi,
  disruptionInboxProcessApi,
  disruptionInboxSingleApi,
  disruptionRejectedApi,
  disruptionRejectedRestoreApi,
  disruptionRejectedSingleApi,
} from "../../../shared/api/admin/disruptions-api";

export const disruptionInboxApiHandler = handle(
  disruptionInboxApi,
  async (ctx) => {
    const inbox = ctx.disruptions.getDisruptionsInInbox();

    return {
      inbox: inbox,
      counts: {
        inbox: inbox.length,
        updated: 0,
      },
    };
  },
);

export const disruptionRejectedApiHandler = handle(
  disruptionRejectedApi,
  async (ctx) => {
    const inbox = ctx.disruptions.getDisruptionsInInbox();
    const rejected = ctx.disruptions.getRejectedDisruptions();

    return {
      rejected: rejected,
      counts: {
        inbox: inbox.length,
        updated: 0,
      },
    };
  },
);

export const disruptionInboxSingleApiHandler = handle(
  disruptionInboxSingleApi,
  async (ctx, { id }) => {
    const inbox = ctx.disruptions.getDisruptionInInbox(id);
    if (inbox == null) {
      return {
        notFound: true as const,
      };
    }

    const provisional = ctx.disruptions.getProvisionalDisruptionsWithSource(id);
    return {
      inbox,
      provisional,
    };
  },
);

export const disruptionRejectedSingleApiHandler = handle(
  disruptionRejectedSingleApi,
  async (ctx, { id }) => {
    const rejected = ctx.disruptions.getRejectedDisruption(id);
    if (rejected == null) {
      return {
        notFound: true as const,
      };
    }

    return {
      rejected,
    };
  },
);

export const disruptionInboxProcessApiHandler = handle(
  disruptionInboxProcessApi,
  async (ctx, params) => {
    try {
      await ctx.disruptions.rejectDisruption(
        ctx,
        params.reject.disruption,
        params.reject.resurfaceIfUpdated,
      );
    } catch (e) {
      // TODO: It's not really an internal server error if the inbox disruption no
      // longer exists, which is probably the most likely cause of errors here.
      throw new BadApiCallError("Failed to reject disruption.", 500);
    }

    return null;
  },
);

export const disruptionRejectedRestoreApiHandler = handle(
  disruptionRejectedRestoreApi,
  async (ctx, params) => {
    try {
      await ctx.disruptions.restoreDisruption(ctx, params.restore);
    } catch (e) {
      // TODO: It's not really an internal server error if the inbox disruption no
      // longer exists, which is probably the most likely cause of errors here.
      throw new BadApiCallError("Failed to restore disruption.", 500);
    }

    return null;
  },
);
