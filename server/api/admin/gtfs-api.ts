import { ServerParams, TrainQuery } from "../../ctx/trainquery";

// TODO: Is this API going to be wrapped with the network data like the
// departures API? It would cause similar issues if this API returns data
// assuming different stops/lines than the frontend has.

export async function gtfsApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  await ctx.adminAuth.legacyThrowUnlessAuthenticated(params, "superadmin");

  const report = ctx.gtfs?.getDataNoRealtime()?.parsingReport;
  if (report == null) {
    return {
      hasData: false,
    };
  }

  return {
    hasData: true,
    unsupportedGtfsStopIDs: Array.from(report.unsupportedGtfsStopIDs),
    unsupportedRoutes: report.unsupportedRoutes,
  };
}
