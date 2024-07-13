import { z } from "zod";
import { isExternalDisruptionID } from "../../../shared/system/ids";
import { ServerParams, TrainQuery } from "../../ctx/trainquery";
import {
  BadApiCallError,
  requireBodyParam,
  requireParam,
} from "../../param-utils";
import { ExternalDisruption } from "../../../shared/disruptions/external/external-disruption";

// TODO: Are these APIs going to be wrapped with the network data like the
// departures API? It would cause similar issues if these APIs return data
// assuming different stops/lines than the frontend has.

export async function disruptionInboxApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  await ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  return {
    inbox: ctx.disruptions.getDisruptionsInInbox().map((x) => x.toJSON()),
  };
}

export async function disruptionInboxSingleApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  const id = requireParam(params, "id");
  if (!isExternalDisruptionID(id)) {
    return {
      notFound: true,
    };
  }

  const inbox = ctx.disruptions.getDisruptionInInbox(id);
  if (inbox == null) {
    return {
      notFound: true,
    };
  }

  const provisional = ctx.disruptions.getProvisionalDisruptionsWithSource(id);
  return {
    inbox: inbox.toJSON(),
    provisional: provisional.map((x) => x.toJSON()),
  };
}

export async function disruptionInboxProcessApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  // TODO: This is dumb, but I only allow key value pairs right now. :/
  const action = requireBodyParam(params, "action");

  // TODO: We should just something like this for ALL param parsing in ALL APIs!
  // TODO: We just support reject for now. Later this schema will be a union
  // which allows the below, but alternatively allows something like:
  // { add: Disruption[]; approve: DisruptionID[]; merge: DisruptionID[]; etc. }
  // (Example only, that schema design might be super dumb lol.)
  const schema = z.object({
    reject: z.object({
      disruption: ExternalDisruption.json,
      resurfaceIfUpdated: z.boolean(),
    }),
  });

  try {
    const actionParsed = schema.safeParse(JSON.parse(action));
    if (!actionParsed.success) {
      throw new BadApiCallError("Invalid action.", 400);
    }

    try {
      await ctx.disruptions.rejectDisruption(
        ctx,
        actionParsed.data.reject.disruption,
        actionParsed.data.reject.resurfaceIfUpdated,
      );
    } catch (e) {
      // TODO: It's not really an internal server error if the inbox disruption no
      // longer exists, which is probably the most likely cause of errors here.
      throw new BadApiCallError("Failed to reject disruption.", 500);
    }

    // TODO: This is dumb. We should be able to just return 200.
    return {
      success: true,
    };
  } catch {
    throw new BadApiCallError("Action was not JSON.", 400);
  }
}
