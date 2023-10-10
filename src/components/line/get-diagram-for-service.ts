import { getConfig } from "@/utils/get-config";
import { requireLine } from "shared/system/config-utils";
import type { LineDiagramData } from "shared/system/routes/line-routes";
import type { Departure } from "shared/system/service/departure";
import { KnownPerspectivePattern } from "shared/system/service/known-perspective-pattern";
import { getPatternList } from "shared/system/service/listed-stop";

export function getDiagramForService(
  departure: Departure
): LineDiagramData | null {
  // Without this check the first stop is not guaranteed to be served, and line
  // diagrams do not currently support showing the first stop as express.
  if (departure.pattern instanceof KnownPerspectivePattern) {
    return null;
  }

  const stops = getPatternList(getConfig(), departure);
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
