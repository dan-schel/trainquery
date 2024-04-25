import { PtvConfig } from "../../../config/ptv-config";
import { EnvironmentVariables } from "../../../ctx/environment-variables";
import { TrainQuery } from "../../../ctx/trainquery";
import {
  NewDisruptionsHandler,
  RawDisruptionSource,
} from "../raw-disruption-source";

export class PtvDisruptionSource extends RawDisruptionSource {
  private readonly _devID: string;
  private readonly _devKey: string;

  constructor(
    private readonly _ctx: TrainQuery,
    private readonly _ptvConfig: PtvConfig,
    onNewDisruptions: NewDisruptionsHandler,
  ) {
    super(onNewDisruptions);

    const ptv = EnvironmentVariables.get().requirePtv();
    this._devID = ptv.devId;
    this._devKey = ptv.devKey;
  }

  init(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
