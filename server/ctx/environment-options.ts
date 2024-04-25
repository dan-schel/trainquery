import fsp from "fs/promises";
import { z } from "zod";
import { AdminLoggingOptions } from "./admin-logs";
import { AdminLogService } from "../../shared/admin/logs";

const ConfigModes = ["local", "online"] as const;
const GtfsModes = [
  "off",
  "clone-prod-db",
  "parse-local",
  "parse-online",
] as const;
const PersistGtfsModes = ["off", "local-db", "prod-db"] as const;
const DisruptionsModes = ["off", "online"] as const;

type ConfigMode = (typeof ConfigModes)[number];
type GtfsMode = (typeof GtfsModes)[number];
type PersistGtfsMode = (typeof PersistGtfsModes)[number];
type DisruptionsMode = (typeof DisruptionsModes)[number];

export class EnvironmentOptions {
  static production = EnvironmentOptions.fromObj({
    name: "production",
    logging: new AdminLoggingOptions("all", "all", true),
    config: "online",
    gtfs: "parse-online",
    persistGtfs: "prod-db",
    disruptions: "online",
  });
  static development = EnvironmentOptions.fromObj({
    name: "development",
    logging: new AdminLoggingOptions([], "all", false),
    config: "online",
    gtfs: "clone-prod-db",
    persistGtfs: "off",
    disruptions: "online",
  });
  static offline = EnvironmentOptions.fromObj({
    name: "offline",
    logging: new AdminLoggingOptions([], "all", false),
    config: "local",
    gtfs: "parse-local",
    persistGtfs: "local-db",
    disruptions: "off",
  });

  static all: Partial<Record<string, EnvironmentOptions>> = {
    production: EnvironmentOptions.production,
    development: EnvironmentOptions.development,
    offline: EnvironmentOptions.offline,
  };

  constructor(
    readonly name: string,
    readonly logging: AdminLoggingOptions,
    readonly config: ConfigMode,
    readonly gtfs: GtfsMode,
    readonly persistGtfs: PersistGtfsMode,
    readonly disruptions: DisruptionsMode,
  ) {}

  toLogString() {
    const printLoggingArray = (array: AdminLogService[] | "all") => {
      if (array === "all") {
        return '"all"';
      }
      return "[" + array.map((x) => '"' + x + '"').join(", ") + "]";
    };

    let result = "";

    result += `Environment (${this.name}):\n`;
    result += `  logging:\n`;
    result += `    info: ${printLoggingArray(this.logging.info)}\n`;
    result += `    warn: ${printLoggingArray(this.logging.warn)}\n`;
    result += `    writeToDatabase: ${this.logging.writeToDatabase}\n`;
    result += `  config: "${this.config}"\n`;
    result += `  gtfs: "${this.gtfs}"\n`;
    result += `  persistGtfs: "${this.persistGtfs}"\n`;
    result += `  disruptions: "${this.disruptions}"\n`;
    result += "NOTE THAT ENVIRONMENT OPTIONS ARE NOT* CURRENTLY USED!";

    return result;
  }

  static loadFromName(name: string) {
    const selected = EnvironmentOptions.all[name];
    if (selected == null) {
      return null;
    }
    return selected;
  }

  static json = z
    .object({
      name: z.string(),
      logging: AdminLoggingOptions.json,
      config: z.enum(ConfigModes),
      gtfs: z.enum(GtfsModes),
      persistGtfs: z.enum(PersistGtfsModes),
      disruptions: z.enum(DisruptionsModes),
    })
    .transform((x) => EnvironmentOptions.fromObj(x));

  static async loadFromFile(path: string) {
    const text = await fsp.readFile(path, { encoding: "utf-8" });
    const json = JSON.parse(text);
    return EnvironmentOptions.json.parse(json);
  }

  static default(isProduction: boolean) {
    return isProduction
      ? EnvironmentOptions.production
      : EnvironmentOptions.development;
  }

  static fromObj(obj: {
    name: string;
    logging: AdminLoggingOptions;
    config: ConfigMode;
    gtfs: GtfsMode;
    persistGtfs: PersistGtfsMode;
    disruptions: DisruptionsMode;
  }) {
    return new EnvironmentOptions(
      obj.name,
      obj.logging,
      obj.config,
      obj.gtfs,
      obj.persistGtfs,
      obj.disruptions,
    );
  }
}
