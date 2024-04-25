import { RawDisruption } from "../../../shared/disruptions-v2/disruption";

export type NewDisruptionsHandler = (disruptions: RawDisruption[]) => void;

// TODO: This will probably one day be refactored to extend from
// TrainQueryService.
export abstract class RawDisruptionSource {
  constructor(protected readonly onNewDisruptions: NewDisruptionsHandler) {}

  abstract init(): Promise<void>;
}
