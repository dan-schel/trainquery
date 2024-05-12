import { ProposedDisruption } from "../../../shared/disruptions-v2/proposed/proposed-disruption";

export type NewDisruptionsHandler = (disruptions: ProposedDisruption[]) => void;

// TODO: This will probably one day be refactored to extend from
// TrainQueryService.
export abstract class ProposedDisruptionSource {
  private readonly _listeners: NewDisruptionsHandler[] = [];

  addListener(listener: NewDisruptionsHandler) {
    this._listeners.push(listener);
  }

  removeListener(listener: NewDisruptionsHandler) {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  protected supplyNewDisruptions(disruptions: ProposedDisruption[]) {
    for (const listener of this._listeners) {
      listener(disruptions);
    }
  }

  abstract init(): Promise<void>;
}
