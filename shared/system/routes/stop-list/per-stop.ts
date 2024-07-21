import { StopList } from "./stop-list";

export class PerRouteStop<T> {
  constructor(
    readonly stopList: StopList,
    readonly data: T[],
  ) {}
}

export class PerCanonicalStop<T> {
  constructor(
    readonly stopList: StopList,
    readonly data: T[],
  ) {}
}

export class PerPossibleStop<T> {
  constructor(
    readonly stopList: StopList,
    readonly data: T[],
  ) {}
}
