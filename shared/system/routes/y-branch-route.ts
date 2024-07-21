import { z } from "zod";
import { DirectionDefinition, Route, createBothDirections } from "./line-route";
import { type RouteVariantID, RouteVariantIDJson } from "../ids";
import { RouteStop } from "./route-stop";

/** The details of a single branch in a {@link YBranchRoute}. */
export class Branch {
  constructor(
    /** Uniquely identifies this branch from others in this route. */
    readonly id: RouteVariantID,
    /**
     * Stops, ordered from the end of the branch to the stop before the shared
     * section begins.
     */
    readonly stops: RouteStop[],
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
    readonly shared: RouteStop[],
  ) {
    super("y-branch", [
      ...createBothDirections(firstBranch.id, forward.id, reverse.id, [
        ...firstBranch.stops,
        ...shared,
      ]),
      ...createBothDirections(secondBranch.id, forward.id, reverse.id, [
        ...secondBranch.stops,
        ...shared,
      ]),
    ]);
  }

  static readonly yBranchJson = z
    .object({
      type: z.literal("y-branch"),
      forward: DirectionDefinition.json,
      reverse: DirectionDefinition.json,
      firstBranch: Branch.json,
      secondBranch: Branch.json,
      shared: RouteStop.json.array(),
    })
    .transform(
      (x) =>
        new YBranchRoute(
          x.forward,
          x.reverse,
          x.firstBranch,
          x.secondBranch,
          x.shared,
        ),
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
    return route.type === "y-branch";
  }
}
