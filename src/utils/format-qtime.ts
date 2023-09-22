import { hour24To12 } from "@schel-d/js-utils";
import type { QTime } from "shared/qtime/qtime";

export function formatTime(
  time: QTime,
  options?: { includeSeconds?: boolean }
) {
  const hour12 = hour24To12(time.hour);
  const hrs = hour12.hour.toFixed();
  const mins = time.minute.toFixed().padStart(2, "0");
  const half = hour12.half;
  if (options?.includeSeconds ?? false) {
    const secs = time.minute.toFixed().padStart(2, "0");
    return `${hrs}:${mins}:${secs}${half}`;
  }
  return `${hrs}:${mins}${half}`;
}

export function formatDuration(duration: { h?: number; m?: number }) {
  // TODO: Handle negative durations?

  const h = duration.h ?? 0;
  const m = duration.m ?? 0;
  const components = [];
  if (h != 0) {
    components.push(h == 1 ? "1 hr" : `${h.toFixed()} hrs`);
  }
  if (m != 0 || h == 0) {
    components.push(m == 1 ? "1 min" : `${m.toFixed()} mins`);
  }
  return components.join(", ");
}
