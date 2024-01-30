import fsp from "fs/promises";
import { z } from "zod";

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
    config: "online",
    gtfs: "parse-online",
    persistGtfs: "prod-db",
    disruptions: "online",
  });
  static development = EnvironmentOptions.fromObj({
    name: "development",
    config: "online",
    gtfs: "clone-prod-db",
    persistGtfs: "off",
    disruptions: "online",
  });
  static offline = EnvironmentOptions.fromObj({
    name: "offline",
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
    readonly config: ConfigMode,
    readonly gtfs: GtfsMode,
    readonly persistGtfs: PersistGtfsMode,
    readonly disruptions: DisruptionsMode,
  ) {}

  log(logger: (msg: string) => void) {
    logger(`Environment (${this.name}):`);
    logger(`  config: "${this.config}"`);
    logger(`  gtfs: "${this.gtfs}"`);
    logger(`  persistGtfs: "${this.persistGtfs}"`);
    logger(`  disruptions: "${this.disruptions}"`);
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
    config: ConfigMode;
    gtfs: GtfsMode;
    persistGtfs: PersistGtfsMode;
    disruptions: DisruptionsMode;
  }) {
    return new EnvironmentOptions(
      obj.name,
      obj.config,
      obj.gtfs,
      obj.persistGtfs,
      obj.disruptions,
    );
  }
}
