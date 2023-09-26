import { LinterRules } from "../../shared/system/linter-rules";
import { Timetable } from "../../shared/system/timetable/timetable";

/** The config properties used by the server and never sent to the frontend. */
export class ServerOnlyConfig {
  constructor(
    /* TODO: continuation */

    /** Rules for the linter. */
    readonly linter: LinterRules,
    readonly timetables: Timetable[]
  ) {}
}
