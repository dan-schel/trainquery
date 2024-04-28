import { ServerParams, TrainQuery } from "../../ctx/trainquery";
import { requireParam } from "../../param-utils";
import { proposedDisruptionToJson } from "../../../shared/disruptions-v2/proposed/proposed-disruption-json";
import { ProposedDisruptionID } from "../../../shared/disruptions-v2/proposed/proposed-disruption";

// TODO: Are these APIs going to be wrapped with the network data like the
// departures API? It would cause similar issues if these APIs return data
// assuming different stops/lines than the frontend has.

export async function disruptionsApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  await ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  return {
    proposed: ctx.disruptions
      .getProposedDisruptions()
      .map((x) => proposedDisruptionToJson(x)),
  };
}

export async function disruptionsRawApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  const encodedDisruptionID = requireParam(params, "id");
  const id = ProposedDisruptionID.decodeFromUrl(encodedDisruptionID);
  if (id == null) {
    return {
      disruption: null,
    };
  }

  const disruption = ctx.disruptions.getProposedDisruption(id);

  return {
    disruption:
      disruption != null ? proposedDisruptionToJson(disruption) : null,
  };
}
