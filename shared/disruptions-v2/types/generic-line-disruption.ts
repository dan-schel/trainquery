import { QUtcDateTime } from "../../qtime/qdatetime";
import { LineID } from "../../system/ids";
import { Disruption, RawDisruptionID } from "../disruption";

export class GenericLineDisruption extends Disruption<"generic-line"> {
  constructor(
    id: string,
    createdAutomatically: boolean,
    sources: RawDisruptionID[],
    readonly message: string,
    readonly affectedLines: LineID[],
    readonly starts: QUtcDateTime,
    readonly ends: QUtcDateTime,
  ) {
    super(id, "generic-line", createdAutomatically, sources);
  }
}
