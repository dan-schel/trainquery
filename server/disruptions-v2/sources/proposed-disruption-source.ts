import { ProposedDisruption } from "../../../shared/disruptions-v2/proposed/proposed-disruption";

export type NewDisruptionsHandler = (disruptions: ProposedDisruption[]) => void;

// TODO: This will probably one day be refactored to extend from
// TrainQueryService.
export abstract class ProposedDisruptionSource {
  constructor(protected readonly onNewDisruptions: NewDisruptionsHandler) {}

  abstract init(): Promise<void>;
}
