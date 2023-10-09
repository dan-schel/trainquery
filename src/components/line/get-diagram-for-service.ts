import { getConfig } from "@/utils/get-config";
import { requireLine } from "shared/system/config-utils";
import type { LineDiagramData } from "shared/system/routes/line-routes";
import type { ContinuifiedDeparture } from "../departures/helpers/continuified-departure";

export function getDiagramForService(
  departure: ContinuifiedDeparture
): LineDiagramData | null {
  const stops = departure.forStint(0, { relevant: false });
  const transparentTo = stops.findIndex(
    (s) => s.stopListIndex == departure.perspectiveIndex
  );

  return {
    loop: [],
    stops: stops.map((x) => ({
      stop: x.stop,
      express: x.type != "served",
    })),
    firstBranch: [],
    secondBranch: [],
    transparentTo: transparentTo,
    color: requireLine(getConfig(), departure.line).color,
  };
}
