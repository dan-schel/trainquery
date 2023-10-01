import { z } from "zod";
import {
  DirectionDefinition,
  Route,
  RouteStop,
  type StopList,
  nonViaStopIDs,
} from "./line-route";
import { type RouteVariantID, RouteVariantIDJson } from "../ids";

/** The details of a single branch in a {@link YBranchRoute}. */
export class Branch {
  constructor(
    /** Uniquely identifies this branch from others in this route. */
    readonly id: RouteVariantID,
    /**
     * Stops, ordered from the end of the branch to the stop before the shared
     * section begins.
     */
    readonly stops: RouteStop[]
  ) {}

  static readonly json = z
    .object({
      id: RouteVariantIDJson,
      stops: RouteStop.json.array(),
    })
    .transform((x) => new Branch(x.id, x.stops));

  toJSON(): z.input<typeof Branch.json> {
    return {
      id: this.id,
      stops: this.stops.map((s) => s.toJSON()),
    };
  }
}

/** Route with two branch options at one end and a shared section at the other. */
export class YBranchRoute extends Route {
  constructor(
    /** Direction details to use for stops in the provided order. */
    readonly forward: DirectionDefinition,
    /** Direction details to use for stops in the reverse order. */
    readonly reverse: DirectionDefinition,
    /**
     * Stops, ordered from the end of the branch to the stop before the shared
     * section begins.
     */
    readonly firstBranch: Branch,
    /**
     * Stops, ordered from the end of the branch to the stop before the shared
     * section begins.
     */
    readonly secondBranch: Branch,
    /** Stops, ordered the first shared stop to the end of the 'fork handle'. */
    readonly shared: RouteStop[]
  ) {
    super("y-branch");
  }

  static readonly yBranchJson = z.object({
    type: z.literal("y-branch"),
    forward: DirectionDefinition.json,
    reverse: DirectionDefinition.json,
    firstBranch: Branch.json,
    secondBranch: Branch.json,
    shared: RouteStop.json.array(),
  });
  static readonly jsonTransform = (
    x: z.infer<typeof YBranchRoute.yBranchJson>
  ) =>
    new YBranchRoute(
      x.forward,
      x.reverse,
      x.firstBranch,
      x.secondBranch,
      x.shared
    );

  toJSON(): z.input<typeof YBranchRoute.yBranchJson> {
    return {
      type: "y-branch",
      forward: this.forward,
      reverse: this.reverse,
      firstBranch: this.firstBranch.toJSON(),
      secondBranch: this.secondBranch.toJSON(),
      shared: this.shared.map((s) => s.toJSON()),
    };
  }

  static detect(route: Route): route is YBranchRoute {
    return route.type == "y-branch";
  }

  getStopLists(): StopList[] {
    const firstBranch = nonViaStopIDs([
      ...this.firstBranch.stops,
      ...this.shared,
    ]);
    const secondBranch = nonViaStopIDs([
      ...this.secondBranch.stops,
      ...this.shared,
    ]);
    const firstBranchReversed = [...firstBranch].reverse();
    const secondBranchReversed = [...secondBranch].reverse();

    return [
      {
        variant: this.firstBranch.id,
        direction: this.forward.id,
        stops: firstBranch.map((h) => h.stop),
        picksUp: firstBranch.map((h) => h.picksUp),
        setsDown: firstBranch.map((h) => h.setsDown),
      },
      {
        variant: this.firstBranch.id,
        direction: this.reverse.id,
        stops: firstBranchReversed.map((h) => h.stop),
        picksUp: firstBranchReversed.map((h) => h.picksUp),
        setsDown: firstBranchReversed.map((h) => h.setsDown),
      },
      {
        variant: this.secondBranch.id,
        direction: this.forward.id,
        stops: secondBranch.map((h) => h.stop),
        picksUp: secondBranch.map((h) => h.picksUp),
        setsDown: secondBranch.map((h) => h.setsDown),
      },
      {
        variant: this.secondBranch.id,
        direction: this.reverse.id,
        stops: secondBranchReversed.map((h) => h.stop),
        picksUp: secondBranchReversed.map((h) => h.picksUp),
        setsDown: secondBranchReversed.map((h) => h.setsDown),
      },
    ];
  }
}
