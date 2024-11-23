import { FullConfig } from "../config/computed-config";
import { Logger } from "../ctx/logger";
import { TrainQuery } from "../ctx/trainquery";
import { TrainQueryDB } from "../ctx/trainquery-db";
import { type Subsystem, SubsystemBuilder, SubsystemCtx } from "./subsystem";

// This is the right-hand side value of the instanceof check. Apparently it
// models a class constructor. The `& { id: string }` part checks that the class
// has a static property `id`. Maybe that's a bit overkill.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SubsystemClass<T> = (new (...args: any[]) => T) & {
  id: string;
};

export class Subsystems {
  private readonly _builders: Map<string, SubsystemBuilder>;
  private _subsystems: Map<string, Subsystem> | null;

  constructor() {
    this._builders = new Map();
    this._subsystems = new Map();
  }

  add(builder: SubsystemBuilder) {
    this._builders.set(builder.subsystemID, builder);
  }

  async init(
    getConfig: () => FullConfig,
    logger: Logger,
    database: TrainQueryDB | null,
  ) {
    const ctx: SubsystemCtx = { getConfig, logger, database, subsystems: this };
    const builders = Array.from(this._builders.values());
    const subsystems = await Promise.all(builders.map((x) => x.build(ctx)));
    this._subsystems = new Map(subsystems.map((x) => [x.id, x]));
  }

  ready(ctx: TrainQuery) {
    if (this._subsystems == null) {
      throw new Error(`Cannot launch subsystems - call init() first.`);
    }
    const subsystems = Array.from(this._subsystems.values());
    subsystems.forEach((x) => x.ready(ctx));
  }

  get<T extends Subsystem>(type: SubsystemClass<T>): T | null {
    if (this._subsystems == null) {
      throw new Error(`Cannot access subsystems - call init() first.`);
    }

    const subsystem = this._subsystems.get(type.id) ?? null;
    if (subsystem == null) {
      return null;
    }

    if (!(subsystem instanceof type)) {
      throw new Error(
        `Subsystem "${type.id}" was not the expected subsystem type.`,
      );
    }
    return subsystem;
  }

  require<T extends Subsystem>(type: SubsystemClass<T>): T {
    const subsystem = this.get(type);
    if (subsystem == null) {
      throw new Error(`Subsystem "${type.id}" not found.`);
    }
    return subsystem;
  }
}
