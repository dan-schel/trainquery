import { LinterRules } from "../../shared/system/linter-rules";
import { Timetable } from "../../shared/system/timetable/timetable";
import { BannersConfig } from "./banners-config";
import { GtfsConfig } from "./gtfs-config";
import { LegalConfig } from "../../shared/system/config/legal-config";
import { PlatformRules } from "./platform-rules";
import { PtvConfig } from "./ptv-config";

/** The config properties used by the server and never sent to the frontend. */
export class ServerOnlyConfig {
  constructor(
    /** Static timetables. */
    readonly timetables: Timetable[],
    /** Static rules for which trains use which platforms. */
    readonly platformRules: PlatformRules,
    /** Configuration for a GTFS data source, if applicable. */
    readonly gtfs: GtfsConfig<true> | GtfsConfig<false> | null,
    /** Configuration for a PTV API data source, if applicable. */
    readonly ptv: PtvConfig | null,
    /** Configuration for banners. */
    readonly banners: BannersConfig,
    /** Rules for the linter. */
    readonly linter: LinterRules,
    /**
     * The markdown code for the about page. Stored in server config so it's
     * only sent to the client when the about page is requested.
     */
    readonly aboutMarkdown: string,
    /** Additional messages for the '/about/legal' page. */
    readonly legal: LegalConfig,
  ) {}
}
