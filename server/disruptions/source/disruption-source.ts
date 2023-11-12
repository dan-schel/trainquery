import { Disruption } from "../disruption";

export type NewDisruptionsHandler = (disruptions: Disruption[]) => void;

export abstract class DisruptionSource {
  constructor(protected readonly onNewDisruptions: NewDisruptionsHandler) {}

  abstract init(): Promise<void>;
}
