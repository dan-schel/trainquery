import { formatDirection } from "@/utils/format-filter";
import { getConfig } from "@/utils/get-config";
import { unique } from "@schel-d/js-utils";
import { linesThatStopAt, requireStop } from "shared/system/config-utils";
import type {
  DirectionID,
  LineID,
  PlatformID,
  StopID,
} from "shared/system/ids";

export type AvailableFilters = {
  lines:
    | {
        displayName: string;
        line: LineID;
      }[]
    | null;

  directions:
    | {
        displayName: string;
        direction: DirectionID;
      }[]
    | null;

  platforms:
    | {
        displayName: string;
        platform: PlatformID;
      }[]
    | null;
};

export function getAvailableFilters(stop: StopID): AvailableFilters {
  const lines = linesThatStopAt(getConfig(), stop, {
    sortAlphabetically: true,
  });

  const lineFilters =
    lines.length < 2
      ? null
      : lines.map((l) => ({
          displayName: l.name,
          line: l.id,
        }));

  const directions = unique(
    lines.map((l) => l.route.getPossibleDirections()).flat(),
    (a, b) => a == b
  );
  const directionFilters =
    directions.length < 2
      ? null
      : directions.map((d) => ({
          displayName: formatDirection(d, { capital: true }),
          direction: d,
        }));

  const platforms = requireStop(getConfig(), stop).platforms;
  const platformFilters =
    platforms.length < 2
      ? null
      : platforms.map((p) => ({
          displayName: p.name,
          platform: p.id,
        }));

  return {
    lines: lineFilters,
    directions: directionFilters,
    platforms: platformFilters,
  };
}
