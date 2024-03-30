import { ServerParams, TrainQuery } from "../../ctx/trainquery";

export async function gtfsApi(
  ctx: TrainQuery,
  params: ServerParams,
): Promise<object> {
  ctx.adminAuth.throwUnlessAuthenticated(params, "superadmin");

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
