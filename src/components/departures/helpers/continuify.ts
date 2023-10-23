import { getConfig } from "@/utils/get-config";
import type { StopID } from "shared/system/ids";
import type { Departure } from "shared/system/service/departure";
import {
  getPatternList,
  type PatternList,
  type PatternListElement,
} from "shared/system/service/listed-stop";

export function continuify(departure: Departure): PatternList {
  const services = departure.getServiceString();

  const lists = services
    .map((s, i) =>
      getPatternList(getConfig(), s).map((e) => ({ stint: i, ...e })),
    )
    .flat()
    .filter(
      (e) => e.stint == 0 && e.stopListIndex >= departure.perspectiveIndex,
    );

  const result: PatternList = [];
  let uncommitted: PatternListElement[] = [];
  const seen = new Set<StopID>();
  for (const entry of lists) {
    if (seen.has(entry.stop) && entry.type != "express" && entry.stint != 0) {
      break;
    }

    uncommitted.push(entry);

    if (entry.type == "served") {
      seen.add(entry.stop);
      result.push(...uncommitted);
      uncommitted = [];
    }
  }

  return result;
}
