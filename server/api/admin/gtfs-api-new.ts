import { handle } from "../api-handler";
import { gtfsApi } from "../../../shared/api/gtfs-api";

export const gtfsApiHandler = handle(gtfsApi, async (ctx, _params) => {
  const report = ctx.gtfs?.getDataNoRealtime()?.parsingReport;
  if (report == null) {
    return {
      hasData: false as const,
    };
  }

  return {
    hasData: true as const,
    unsupportedGtfsStopIDs: Array.from(report.unsupportedGtfsStopIDs),
    unsupportedRoutes: report.unsupportedRoutes,
  };
});
