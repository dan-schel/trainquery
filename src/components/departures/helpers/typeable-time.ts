import { hour12To24, parseIntNull } from "@dan-schel/js-utils";
import { QTime } from "shared/qtime/qtime";

const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export class TypeableTime {
  static blank = new TypeableTime("", false, "", "");

  constructor(
    readonly hour: string,
    readonly explicitlyDivided: boolean,
    readonly minute: string,
    readonly ampm: string,
  ) {}

  with({
    hour,
    explicitlyDivided,
    minute,
    ampm,
  }: {
    hour?: string;
    explicitlyDivided?: boolean;
    minute?: string;
    ampm?: string;
  }) {
    return new TypeableTime(
      hour === undefined ? this.hour : hour,
      explicitlyDivided === undefined
        ? this.explicitlyDivided
        : explicitlyDivided,
      minute === undefined ? this.minute : minute,
      ampm === undefined ? this.ampm : ampm,
    );
  }

  type(_character: string): TypeableTime {
    // This is awful, sorry :/

    const character = _character.toLowerCase();
    if (character === "a") {
      return this.with({ ampm: "a" });
    } else if (character === "p") {
      return this.with({ ampm: "p" });
    } else if (character === "m" && this.ampm.length === 1) {
      return this.with({ ampm: this.ampm + "m" });
    } else if (
      (character === ":" || character === ";") &&
      !this.explicitlyDivided &&
      this.hour.length === 0 &&
      this.minute.length !== 0
    ) {
      return this.with({
        hour: this.minute,
        explicitlyDivided: true,
        minute: "",
      });
    } else if (digits.includes(character)) {
      if (this.explicitlyDivided && this.minute.length < 2) {
        return this.with({
          minute: this.minute + character,
        });
      } else if (this.minute.length < 2) {
        return this.with({
          minute: this.minute + character,
        });
      } else if (this.minute.length === 2 && this.hour.length < 2) {
        return this.with({
          hour: this.hour + this.minute[0],
          minute: this.minute[1] + character,
        });
      }
    }

    return this.with({});
  }
  backspace(): TypeableTime {
    // This is awful, sorry :/

    if (this.ampm.length > 0) {
      return this.with({
        ampm: this.ampm.slice(0, -1),
      });
    } else if (this.explicitlyDivided && this.minute.length > 0) {
      return this.with({
        minute: this.minute.slice(0, -1),
      });
    } else if (this.explicitlyDivided && this.minute.length === 0) {
      return this.with({
        explicitlyDivided: false,
        minute: this.hour,
        hour: "",
      });
    } else if (this.hour.length > 0) {
      return this.with({
        hour: this.hour.slice(0, -1),
        minute: this.hour[this.hour.length - 1] + this.minute.slice(0, -1),
      });
    } else if (this.minute.length > 0) {
      return this.with({
        minute: this.minute.slice(0, -1),
      });
    }
    return this.with({});
  }

  extractTime(): QTime | null {
    const hour = parseIntNull(this.hour);
    const minute = parseIntNull(this.minute);
    if (
      hour == null ||
      hour < 0 ||
      hour > 23 ||
      minute == null ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }
    if (this.ampm.length !== 0) {
      if (hour < 1 || hour > 12) {
        return null;
      }
      const half = this.ampm.startsWith("a") ? "am" : "pm";
      return new QTime(hour12To24(hour, half), minute, 0);
    } else {
      return new QTime(hour, minute, 0);
    }
  }
}
