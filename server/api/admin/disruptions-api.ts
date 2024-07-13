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
