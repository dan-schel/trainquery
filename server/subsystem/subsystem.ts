import { FullConfig } from "../config/computed-config";
import { Logger } from "../ctx/logger";
import { TrainQuery } from "../ctx/trainquery";
import { TrainQueryDB } from "../ctx/trainquery-db";
import { SubsystemClass, type Subsystems } from "./subsystems";

export type SubsystemCtx = {
  readonly getConfig: () => FullConfig;
  readonly database: TrainQueryDB | null;
  readonly logger: Logger;
  readonly subsystems: Subsystems;
};

export abstract class Subsystem {
  constructor(
    private readonly ctx: SubsystemCtx,
    readonly id: string,
  ) {}

  abstract ready(ctx: TrainQuery): void;

  protected getConfig(): FullConfig {
    return this.ctx.getConfig();
  }

  protected getDatabase(): TrainQueryDB | null {
    return this.ctx.database;
  }

  protected getLogger(): Logger {
    return this.ctx.logger;
  }

  protected getSubsystem<T extends Subsystem>(
    type: SubsystemClass<T>,
  ): T | null {
    return this.ctx.subsystems.get(type);
  }

  protected requireSubsystem<T extends Subsystem>(type: SubsystemClass<T>): T {
    return this.ctx.subsystems.require(type);
  }
}

export abstract class SubsystemBuilder {
  constructor(readonly subsystemID: string) {}

  abstract build(ctx: SubsystemCtx): Promise<Subsystem>;
}
