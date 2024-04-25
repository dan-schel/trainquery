import { z } from "zod";
import { AdminLogService, AdminLogServicesJson } from "../../shared/admin/logs";

export class AdminLoggingOptions {
  constructor(
    readonly info: AdminLogService[] | "all",
    readonly warn: AdminLogService[] | "all",
    readonly writeToDatabase: boolean,
  ) {}

  static readonly json = z
    .object({
      info: z.union([z.array(AdminLogServicesJson), z.literal("all")]),
      warn: z.union([z.array(AdminLogServicesJson), z.literal("all")]),
      writeToDatabase: z.boolean(),
    })
    .transform(
      (x) => new AdminLoggingOptions(x.info, x.warn, x.writeToDatabase),
    );

  toJSON(): z.input<typeof AdminLoggingOptions.json> {
    return {
      info: this.info,
      warn: this.warn,
      writeToDatabase: this.writeToDatabase,
    };
  }
}
