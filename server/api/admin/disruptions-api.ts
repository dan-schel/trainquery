import { nowUTCLuxon } from "../../../shared/qtime/luxon-conversions";
import { ServerParams, TrainQuery } from "../../ctx/trainquery";

export async function disruptionsApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  await ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

  const current = ctx.disruptions.all.filter((x) =>
    x.occursAt(ctx, nowUTCLuxon()),
  );
  const nonCurrent = ctx.disruptions.all.filter(
    (x) => !x.occursAt(ctx, nowUTCLuxon()),
  );
  return {
    current: current.map((x) => x.toJSON(ctx)),
    nonCurrent: nonCurrent.map((x) => x.toJSON(ctx)),
  };
}
