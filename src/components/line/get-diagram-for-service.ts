import { getConfig } from "@/utils/get-config";
import { requireLine } from "shared/system/config-utils";
import type { LineDiagramData } from "shared/system/routes/line-routes";
import type { Service } from "shared/system/timetable/service";
import { PartialStoppingPattern } from "shared/system/timetable/stopping-pattern";

export function getDiagramForService(service: Service): LineDiagramData | null {
  if (service.stoppingPattern instanceof PartialStoppingPattern) {
    return null;
  }

  const stops = service.stoppingPattern.trim();

  return {
    loop: [],
    stops: stops,
    firstBranch: [],
    secondBranch: [],
    transparentTo: 0,
    color: requireLine(getConfig(), service.line).color,
  };
}
