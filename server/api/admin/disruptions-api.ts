import { isExternalDisruptionID } from "../../../shared/system/ids";
import { ServerParams, TrainQuery } from "../../ctx/trainquery";
import { requireParam } from "../../param-utils";

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
      disruption: null,
    };
  }

  const disruption = ctx.disruptions.getDisruptionInInbox(id);

  return {
    disruption: disruption?.toJSON() ?? null,
  };
}
