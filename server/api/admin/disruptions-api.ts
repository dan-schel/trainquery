import { ExternalDisruptionID } from "../../../shared/disruptions/external/external-disruption-id";
import { ServerParams, TrainQuery } from "../../ctx/trainquery";
import { requireParam } from "../../param-utils";

// TODO: Are these APIs going to be wrapped with the network data like the
// departures API? It would cause similar issues if these APIs return data
// assuming different stops/lines than the frontend has.

export async function disruptionsApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  await ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  return {
    inbox: ctx.disruptions.getExternalDisruptions().map((x) => x.toJSON()),
  };
}

export async function disruptionsRawApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  const encodedDisruptionID = requireParam(params, "id");
  const id = ExternalDisruptionID.decodeFromUrl(encodedDisruptionID);
  if (id == null) {
    return {
      disruption: null,
    };
  }

  const disruption = ctx.disruptions.getExternalDisruption(id);

  return {
    disruption: disruption?.toJSON() ?? null,
  };
}
