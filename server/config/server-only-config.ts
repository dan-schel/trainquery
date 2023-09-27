import { LinterRules } from "../../shared/system/linter-rules";
import { Timetable } from "../../shared/system/timetable/timetable";
import { PlatformRules } from "./platform-rules";

/** The config properties used by the server and never sent to the frontend. */
export class ServerOnlyConfig {
  constructor(
    /* TODO: continuation */

    /** Static timetables. */
    readonly timetables: Timetable[],
    /** Static rules for which trains use which platforms. */
    readonly platformRules: PlatformRules,
    /** Rules for the linter. */
    readonly linter: LinterRules
  ) {}
}
