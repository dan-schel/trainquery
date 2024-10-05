import { handle } from "../api-handler";
import { gtfsApi } from "../../../shared/api/admin/gtfs-api";

export const gtfsApiHandler = handle(gtfsApi, async (ctx) => {
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
