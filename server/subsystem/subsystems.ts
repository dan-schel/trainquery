import { FullConfig } from "../config/computed-config";
import { Logger } from "../ctx/logger";
import { TrainQuery } from "../ctx/trainquery";
import { TrainQueryDB } from "../ctx/trainquery-db";
import { Subsystem } from "./subsystem";

// This is the right-hand side value of the instanceof check. Apparently it
// models a class constructor.
type ClassOf<T> = new (...args: any[]) => T;

export class Subsystems {
  private _subsystems: Map<string, Subsystem>;

  constructor() {
    this._subsystems = new Map();
  }

  add(subsystem: Subsystem) {
    this._subsystems.set(subsystem.id, subsystem);
  }

  get(id: string): Subsystem | null {
    return this._subsystems.get(id) ?? null;
  }

  require<T extends Subsystem>(subsystemId: string, type: ClassOf<T>): T {
    const subsystem = this.get(subsystemId);
    if (subsystem == null) {
      throw new Error(`Subsystem "${subsystemId}" not found.`);
    }
    if (!(subsystem instanceof type)) {
      throw new Error(
        `Subsystem "${subsystemId}" was not the expected subsystem type.`,
      );
    }
    return subsystem;
  }

  asArray(): Subsystem[] {
    return Array.from(this._subsystems.values());
  }

  async init(
    config: FullConfig,
    logger: Logger,
    database: TrainQueryDB | null,
  ) {
    await Promise.all(
      this.asArray().map((x) => x.init(config, logger, database)),
    );
  }

  async ready(ctx: TrainQuery) {
    this.asArray().forEach((x) => x.ready(ctx));
  }
}
