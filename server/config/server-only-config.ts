import { LinterRules } from "../../shared/system/linter-rules";
import { Timetable } from "../../shared/system/timetable/timetable";
import { ContinuationConfig } from "./continuation-config";
import { GtfsConfig } from "./gtfs-config";
import { PlatformRules } from "./platform-rules";

/** The config properties used by the server and never sent to the frontend. */
export class ServerOnlyConfig {
  constructor(
    /** Static timetables. */
    readonly timetables: Timetable[],
    /** Continuation rules (i.e. which lines continue on as which others). */
    readonly continuation: ContinuationConfig,
    /** Static rules for which trains use which platforms. */
    readonly platformRules: PlatformRules,
    /** Configuration for a GTFS data source, if applicable. */
    readonly gtfs: GtfsConfig<true> | GtfsConfig<false> | null,
    /** Rules for the linter. */
    readonly linter: LinterRules,
    /**
     * The markdown code for the about page. Stored in server config so it's
     * only sent to the client when the about page is requested.
     */
    readonly aboutMarkdown: string,
  ) {}
}
