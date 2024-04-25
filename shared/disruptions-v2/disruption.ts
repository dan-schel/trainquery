import { QUtcDateTime } from "../qtime/qdatetime";

export class RawDisruptionID {
  constructor(
    readonly source: string,
    readonly idAtSource: string,
  ) {}
}

export class RawDisruption {
  constructor(
    readonly id: RawDisruptionID,
    readonly markdown: string,
    readonly starts: QUtcDateTime,
    readonly ends: QUtcDateTime,
  ) {}
}

export abstract class Disruption<Type extends string> {
  constructor(
    readonly id: string,
    readonly type: Type,
    readonly createdAutomatically: boolean,

    // TODO: Could a URL be a source, even if a raw disruption isn't what is
    // ultimately providing the URL?
    readonly sources: RawDisruptionID[],
  ) {}
}
