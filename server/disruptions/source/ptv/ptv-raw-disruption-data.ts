import { listifyAnd, nonNull } from "@dan-schel/js-utils";
import { QUtcDateTime } from "../../../../shared/qtime/qdatetime";
import {
  requireLine,
  requireStop,
} from "../../../../shared/system/config-utils";
import { hashString } from "../../../../shared/system/cyrb53";
import { LineID, StopID } from "../../../../shared/system/ids";
import { TrainQuery } from "../../../ctx/trainquery";
import { formatDateTime } from "../../../../shared/qtime/format";
import { toLocalDateTimeLuxon } from "../../../../shared/qtime/luxon-conversions";

export class PtvRawDisruptionData {
  readonly hash: string;
  constructor(
    readonly id: number,
    readonly title: string,
    readonly description: string,
    readonly affectedLines: LineID[],
    readonly affectedStops: StopID[],
    readonly url: string | null,
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {
    this.hash = hashString(
      JSON.stringify({
        id,
        title,
        description,
        affectedLines,
        affectedStops,
        url,
        starts: starts?.toJSON(),
        ends: ends?.toJSON(),
      }),
    );
  }

  createInfoMarkdown(ctx: TrainQuery): string {
    const keyValue: Record<string, string | null> = {
      ID: this.id.toFixed(),
      URL: this.url != null ? `[${this.url}](${this.url})` : "N/A",
      "Affected lines":
        this.affectedLines.length !== 0
          ? listifyAnd(
              this.affectedLines.map(
                (x) => requireLine(ctx.getConfig(), x).name,
              ),
            )
          : "N/A",
      "Affected stops":
        this.affectedStops.length !== 0
          ? listifyAnd(
              this.affectedStops.map(
                (x) => requireStop(ctx.getConfig(), x).name,
              ),
            )
          : "N/A",
      Starts:
        this.starts != null
          ? formatDateTime(toLocalDateTimeLuxon(ctx.getConfig(), this.starts), {
              includeYear: true,
            })
          : "N/A",
      Ends:
        this.ends != null
          ? formatDateTime(toLocalDateTimeLuxon(ctx.getConfig(), this.ends), {
              includeYear: true,
            })
          : "N/A",
    };

    return `
    # ${this.title}
    ${this.description}
    ${Object.keys(keyValue)
      .map((x) => (keyValue[x] == null ? null : `**${x}**: ${keyValue[x]}`))
      .filter(nonNull)
      .join("\n")}
    `;
  }
}
