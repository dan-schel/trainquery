import { QUtcDateTime } from "../../qtime/qdatetime";
import { StopID } from "../../system/ids";
import { Disruption, RawDisruptionID } from "../disruption";

export class GenericStopDisruption extends Disruption<"generic-stop"> {
  constructor(
    id: string,
    createdAutomatically: boolean,
    sources: RawDisruptionID[],
    readonly message: string,
    readonly affectedStops: StopID[],
    readonly starts: QUtcDateTime,
    readonly ends: QUtcDateTime,
  ) {
    super(id, "generic-stop", createdAutomatically, sources);
  }
}
