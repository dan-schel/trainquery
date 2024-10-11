import { FullConfig } from "../config/computed-config";
import { Logger } from "../ctx/logger";
import { TrainQuery } from "../ctx/trainquery";
import { TrainQueryDB } from "../ctx/trainquery-db";

export abstract class Subsystem<T extends object = object> {
  private _postInitData: T | null = null;

  constructor(readonly id: string) {}

  async init(
    config: FullConfig,
    logger: Logger,
    database: TrainQueryDB | null,
  ) {
    this._postInitData = await this.onInit(config, logger, database);
  }

  ready(ctx: TrainQuery) {
    this.onReady(ctx, this.requirePostInitData());
  }

  requirePostInitData() {
    if (this._postInitData == null) {
      throw new Error("Subsystem not initialized.");
    }
    return this._postInitData;
  }

  protected abstract onInit(
    config: FullConfig,
    logger: Logger,
    database: TrainQueryDB | null,
  ): Promise<T>;

  protected abstract onReady(ctx: TrainQuery, postInitData: T): void;
}
