import type { QTime } from "shared/qtime/qtime";

export class TypeableTime {
  static blank = new TypeableTime("", false, "", null);

  constructor(
    readonly hour: string,
    readonly explicitlyDivided: boolean,
    readonly minute: string,
    readonly ampm: "am" | "pm" | null
  ) {
  }

  with({ hour, explicitlyDivided, minute, ampm }: { hour?: string, explicitlyDivided?: boolean, minute?: string, ampm?: "am" | "pm" | null }) {
    return new TypeableTime(
      hour === undefined ? this.hour : hour,
      explicitlyDivided === undefined ? this.explicitlyDivided : explicitlyDivided,
      minute === undefined ? this.minute : minute,
      ampm === undefined ? this.ampm : ampm,
    );
  }

  type(character: string): TypeableTime {
    // TODO: Properly handle typing.
    return this.with({});
  }
  backspace(): TypeableTime {
    // TODO: Properly handle backspacing.
    return this.with({});
  }
  delete(): TypeableTime {
    // TODO: Properly handle deleting.
    return this.with({});
  }

  extractTime(): QTime | null {
    // TODO: Parse the time.
    return null;
  }
}
