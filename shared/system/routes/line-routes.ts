import { type LineColor } from "../enums";
import { type StopID } from "../ids";
import { Line } from "../line";
import { HookRoute } from "./hook-route";
import { Route, RouteStop } from "./line-route";
import { LinearRoute } from "./linear-route";
import { YBranchRoute } from "./y-branch-route";

export type LineDiagramStop<ServedData, ExpressData> = {
  stop: StopID;
  express: false;
  data: ServedData;
} | {
  stop: StopID;
  express: true;
  data: ExpressData;
}

export type LineDiagramData<ServedData, ExpressData> = {
  loop: LineDiagramStop<ServedData, ExpressData>[];
  stops: LineDiagramStop<ServedData, ExpressData>[];
  firstBranch: LineDiagramStop<ServedData, ExpressData>[];
  secondBranch: LineDiagramStop<ServedData, ExpressData>[];
  transparentTo: number;
  color: LineColor;
};

type Then<T> = {
  linear: (r: LinearRoute) => T;
  "y-branch": (r: YBranchRoute) => T;
  hook: (r: HookRoute) => T;
};

export function fromRouteType<T>(route: Route, then: Then<T>): T {
  if (LinearRoute.detect(route)) {
    return then.linear(route);
  } else if (YBranchRoute.detect(route)) {
    return then["y-branch"](route);
  } else if (HookRoute.detect(route)) {
    return then.hook(route);
  }
  throw new Error(`Unrecognized line route type "${route.type}".`);
}

export function getRouteDiagram(line: Line): LineDiagramData<null, null> {
  const stopIDs = (...a: RouteStop[][]) =>
    a
      .flat()
      .map((s) => ({ stop: s.stop, express: s.via, data: null }))
      .reverse();

  return {
    loop: fromRouteType(line.route, {
      linear: (_r) => [],
      "y-branch": (_r) => [],
      hook: (r) => stopIDs(r.hooked, r.direct.slice(0, -1).reverse()),
    }),
    stops: fromRouteType(line.route, {
      linear: (r) => stopIDs(r.stops),
      "y-branch": (r) => stopIDs(r.shared),
      hook: (r) => stopIDs(r.stops),
    }),
    firstBranch: fromRouteType(line.route, {
      linear: (_r) => [],
      "y-branch": (r) => stopIDs(r.firstBranch.stops),
      hook: (_r) => [],
    }),
    secondBranch: fromRouteType(line.route, {
      linear: (_r) => [],
      "y-branch": (r) => stopIDs(r.secondBranch.stops),
      hook: (_r) => [],
    }),
    transparentTo: 0,
    color: line.color,
  };
}
