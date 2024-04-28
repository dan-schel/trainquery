import { Disruption } from "../../shared/disruptions-v2/disruption";
import { DepartureWithDisruptions } from "../../shared/disruptions-v2/departure-with-disruptions";
import { Departure } from "../../shared/system/service/departure";
import { TrainQuery } from "../ctx/trainquery";
import { PtvDisruptionSource } from "./sources/ptv/ptv-disruption-source";
import { DisruptionTypeHandler } from "./type-handlers/disruption-type-handler";
import { GenericLineDisruptionHandler } from "./type-handlers/generic-line-disruption-handler";
import { GenericStopDisruptionHandler } from "./type-handlers/generic-stop-disruption-handler";
import { ProposedDisruptionSource } from "./sources/proposed-disruption-source";
import { ProposedDisruption } from "../../shared/disruptions-v2/proposed/proposed-disruption";
import { PtvProposedDisruption } from "../../shared/disruptions-v2/proposed/types/ptv-proposed-disruption";
import { GenericLineDisruption } from "../../shared/disruptions-v2/types/generic-line-disruption";
import { GenericStopDisruption } from "../../shared/disruptions-v2/types/generic-stop-disruption";

export class DisruptionsManager {
  private readonly _sources: ProposedDisruptionSource[];
  private readonly _handlers: Map<string, DisruptionTypeHandler<Disruption>>;

  // TODO: This is a local cache of disruptions so we don't need to query the
  // database every single time.
  private readonly _disruptions: Disruption[];

  constructor(private readonly _ctx: TrainQuery) {
    this._handlers = new Map();
    this._sources = [];
    this._disruptions = [];
  }

  async init(): Promise<void> {
    this._handlers.set(
      "generic-stop",
      new GenericStopDisruptionHandler(this._ctx),
    );
    this._handlers.set(
      "generic-line",
      new GenericLineDisruptionHandler(this._ctx),
    );

    const ptvConfig = this._ctx.getConfig().server.ptv;
    if (!this._ctx.isOffline && ptvConfig != null) {
      this._sources.push(
        new PtvDisruptionSource(this._ctx, ptvConfig, (d) =>
          this._handleNewDisruptions(d),
        ),
      );
    }

    await Promise.all(this._sources.map((source) => source.init()));
  }

  private _handleNewDisruptions = (disruptions: ProposedDisruption[]) => {
    console.log(
      `Just recieved ${disruptions.length} disruptions. What I do with them is yet to be implemented!`,
    );

    // <TEMPORARY>
    // When we do it for real, this is where we should check these proposed
    // disruptions against the database to see if they've already been curated
    // or automatically processed, ... and so on.

    // This is how you clear an array in Javascript. Wild.
    this._disruptions.length = 0;

    for (const proposal of disruptions) {
      if (!(proposal instanceof PtvProposedDisruption)) {
        continue;
      }

      const hasStopVibes = /^.{3,30}( line)? stations?:.{10}/gi.test(
        proposal.title,
      );

      if (proposal.affectedLines.length !== 0 && !hasStopVibes) {
        this._disruptions.push(
          new GenericLineDisruption(
            // The ID should be randomly generated UUID when we do this for
            // real, but since we're regenerating every 5 mins, let's make it
            // the PTV ID for now to keep it stable.
            proposal.id.idAtSource,

            true,
            [proposal.id],
            proposal.title,
            proposal.affectedLines,
            proposal.starts,
            proposal.ends,
          ),
        );
      } else if (proposal.affectedStops.length !== 0) {
        this._disruptions.push(
          new GenericStopDisruption(
            // The ID should be randomly generated UUID when we do this for
            // real, but since we're regenerating every 5 mins, let's make it
            // the PTV ID for now to keep it stable.
            proposal.id.idAtSource,

            true,
            [proposal.id],
            proposal.title,
            proposal.affectedStops,
            proposal.starts,
            proposal.ends,
          ),
        );
      }
    }
    // </TEMPORARY>
  };

  attachDisruptions(departure: Departure): DepartureWithDisruptions {
    const disruptions = this._disruptions.filter((d) =>
      this._requireHandler(d).affectsService(d, departure),
    );
    return new DepartureWithDisruptions(departure, disruptions);
  }

  private _requireHandler(disruption: Disruption) {
    const handler = this._handlers.get(disruption.type);
    if (handler == null) {
      throw new Error(`No handler for disruption type "${disruption.type}".`);
    }
    return handler;
  }
}
