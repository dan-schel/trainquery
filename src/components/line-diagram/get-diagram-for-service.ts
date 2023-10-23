import { getConfig } from "@/utils/get-config";
import type { QUtcDateTime } from "shared/qtime/qdatetime";
import { requireLine } from "shared/system/config-utils";
import type { ConfidenceLevel } from "shared/system/enums";
import type { PlatformID } from "shared/system/ids";
import type { LineDiagramData } from "shared/system/routes/line-routes";
import type { Departure } from "shared/system/service/departure";
import { KnownPerspectivePattern } from "shared/system/service/known-perspective-pattern";
import { getPatternList } from "shared/system/service/listed-stop";

export type AdditionalServedData = {
  scheduledTime: QUtcDateTime | null;
  platform: {
    id: PlatformID;
    confidence: ConfidenceLevel;
  } | null;
};

export function getDiagramForService(
  departure: Departure,
): LineDiagramData<AdditionalServedData, null> | null {
  // Without this check the first stop is not guaranteed to be served, and line
  // diagrams do not currently support showing the first stop as express.
  if (departure.pattern instanceof KnownPerspectivePattern) {
    return null;
  }

  const stops = getPatternList(getConfig(), departure);
  const transparentTo = stops.findIndex(
    (s) => s.stopListIndex == departure.perspectiveIndex,
  );

  return {
    loop: [],
    stops: stops.map((x) => {
      if (x.type == "served") {
        return {
          stop: x.stop,
          express: false,
          data: {
            scheduledTime: x.detail?.scheduledTime ?? null,
            platform: x.detail?.platform ?? null,
          },
        };
      } else {
        return {
          stop: x.stop,
          express: true,
          data: null,
        };
      }
    }),
    firstBranch: [],
    secondBranch: [],
    transparentTo: transparentTo,
    color: requireLine(getConfig(), departure.line).color,
  };
}
