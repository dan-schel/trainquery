import { z } from "zod";
import { type ServiceMode, ServiceModeJson } from "./enums";
import { type ServiceTypeID, ServiceTypeIDJson } from "./ids";

export class ServiceType {
  constructor(
    readonly id: ServiceTypeID,
    readonly mode: ServiceMode,
  ) {}

  static readonly json = z
    .object({
      id: ServiceTypeIDJson,
      mode: ServiceModeJson,
    })
    .transform((x) => new ServiceType(x.id, x.mode));

  toJSON(): z.input<typeof ServiceType.json> {
    return {
      id: this.id,
      mode: this.mode,
    };
  }
}
