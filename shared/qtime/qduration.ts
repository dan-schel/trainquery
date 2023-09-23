export type DurationComponents = {
  d?: number;
  h?: number;
  m?: number;
  s?: number;
};

export type InformalDuration = QDuration | DurationComponents;

export class QDuration {
  private _seconds: number;

  constructor({
    d = 0,
    h = 0,
    m = 0,
    s = 0,
  }: DurationComponents) {
    this._seconds = d * 24 * 60 * 60 + h * 60 * 60 + m * 60 + s;
  }

  get isNegative() {
    return this._seconds < 0;
  }

  get inDays() {
    return this._seconds / (24 * 60 * 60);
  }
  get inHrs() {
    return this._seconds / (60 * 60);
  }
  get inMins() {
    return this._seconds / 60;
  }
  get inSecs() {
    return this._seconds;
  }

  get components() {
    return {
      d: Math.trunc(this.inDays),
      h: Math.trunc(this.inHrs) % 24,
      m: Math.trunc(this.inMins) % 60,
      s: Math.trunc(this.inSecs) % 60,
    };
  }

  get positiveComponents() {
    return {
      d: Math.floor(Math.abs(this.inDays)),
      h: Math.floor(Math.abs(this.inHrs)) % 24,
      m: Math.floor(Math.abs(this.inMins)) % 60,
      s: Math.floor(Math.abs(this.inSecs)) % 60,
    };
  }

  static formalize(input: InformalDuration): QDuration {
    if (input instanceof QDuration) {
      return input;
    }
    return new QDuration(input);
  }
}
