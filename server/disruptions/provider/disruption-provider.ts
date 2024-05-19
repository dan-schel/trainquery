import { ExternalDisruptionData } from "../../../shared/disruptions/external/external-disruption-data";

export type NewDisruptionsHandler = (
  disruptions: ExternalDisruptionData[],
) => void;

// TODO: This will probably one day be refactored to extend from
// TrainQueryService.
export abstract class DisruptionProvider {
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

  protected provideNewDisruptions(disruptions: ExternalDisruptionData[]) {
    for (const listener of this._listeners) {
      listener(disruptions);
    }
  }

  abstract init(): Promise<void>;
}
