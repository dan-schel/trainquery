import { type StopID, StopIDJson } from "shared/system/ids";
import { DepartureFilter } from "shared/system/timetable/departure-filter";
import { z } from "zod";

export class PinnedWidget {
  constructor(readonly stop: StopID, readonly filter: DepartureFilter) {}

  static readonly json = z
    .object({
      // The "as any" is there to stop a weird error... I tried!
      stop: StopIDJson as any,
      filter: DepartureFilter.json,
    })
    .transform((x) => new PinnedWidget(x.stop, x.filter));

  toJSON(): z.input<typeof PinnedWidget.json> {
    return {
      stop: this.stop,
      filter: this.filter.toJSON(),
    };
  }
}

export class SignificantStop {
  constructor(readonly stop: StopID, readonly significance: string) {}

  static readonly json = z
    .object({
      // The "as any" is there to stop a weird error... I tried!
      stop: StopIDJson as any,
      significance: z.string(),
    })
    .transform((x) => new SignificantStop(x.stop, x.significance));

  toJSON(): z.input<typeof SignificantStop.json> {
    return {
      stop: this.stop,
      significance: this.significance,
    };
  }
}
