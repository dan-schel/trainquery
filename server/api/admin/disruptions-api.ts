import { RawDisruptionIDComponents } from "../../disruptions/raw-disruption-id-components";
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
    raw: ctx.disruptions.getRaw().map((x) => x.toJSON(ctx)),
  };
}

export async function disruptionsRawApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  const encodedDisruptionID = requireParam(params, "id");
  const decoded = RawDisruptionIDComponents.decode(encodedDisruptionID);
  if (decoded == null) {
    return {
      disruption: null,
    };
  }

  const disruption = ctx.disruptions.getRawDisruption(
    decoded.source,
    decoded.id,
  );

  if (disruption == null) {
    return {
      disruption: null,
    };
  }

  return {
    disruption: {
      markdown: disruption.createInfoMarkdown(ctx),
    },
  };
}
