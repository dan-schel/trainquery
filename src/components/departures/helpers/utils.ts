import type { ContinuifyResult } from "./continuify";
import { requireStop } from "shared/system/config-utils";
import { getConfig } from "@/utils/get-config";

export function getTerminus(detail: ContinuifyResult) {
  const stopID = detail[detail.length - 1].stop;
  return {
    id: stopID,
    name: requireStop(getConfig(), stopID).name,
  };
}
