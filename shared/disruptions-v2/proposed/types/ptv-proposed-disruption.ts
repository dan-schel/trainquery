import { z } from "zod";
import {
  ProposedDisruption,
  ProposedDisruptionFactory,
  ProposedDisruptionID,
} from "../proposed-disruption";
import {
  LineIDJson,
  StopIDJson,
  type LineID,
  type StopID,
} from "../../../system/ids";
import { QUtcDateTime } from "../../../qtime/qdatetime";
import {
  type HasSharedConfig,
  requireLine,
  requireStop,
} from "../../../system/config-utils";
import { formatDateTime } from "../../../qtime/format";
import { toLocalDateTimeLuxon } from "../../../qtime/luxon-conversions";
import { listifyAnd, nonNull } from "@dan-schel/js-utils";

const proposedDisruptionType = "ptv";

export class PtvProposedDisruption extends ProposedDisruption {
  constructor(
    id: ProposedDisruptionID,
    readonly title: string,
    readonly description: string,
    readonly affectedLines: LineID[],
    readonly affectedStops: StopID[],
    readonly url: string | null,
    readonly starts: QUtcDateTime | null,
    readonly ends: QUtcDateTime | null,
  ) {
    super(proposedDisruptionType, id);
  }

  getMarkdown(config: HasSharedConfig): string {
    const keyValue: Record<string, string | null> = {
      "PTV ID": this.id.idAtSource,
      URL: this.url != null ? `[${this.url}](${this.url})` : "N/A",
      "Affected lines":
        this.affectedLines.length !== 0
          ? listifyAnd(
              this.affectedLines.map((x) => requireLine(config, x).name),
            )
          : "N/A",
      "Affected stops":
        this.affectedStops.length !== 0
          ? listifyAnd(
              this.affectedStops.map((x) => requireStop(config, x).name),
            )
          : "N/A",
      Starts:
        this.starts != null
          ? formatDateTime(toLocalDateTimeLuxon(config, this.starts), {
              includeYear: true,
            })
          : "N/A",
      Ends:
        this.ends != null
          ? formatDateTime(toLocalDateTimeLuxon(config, this.ends), {
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

  getStart(): QUtcDateTime | null {
    return this.starts;
  }

  getEnd(): QUtcDateTime | null {
    return this.ends;
  }

  static readonly json = z
    .object({
      id: ProposedDisruptionID.json,
      title: z.string(),
      description: z.string(),
      affectedLines: LineIDJson.array(),
      affectedStops: StopIDJson.array(),
      url: z.string().nullable(),
      starts: QUtcDateTime.json.nullable(),
      ends: QUtcDateTime.json.nullable(),
    })
    .transform(
      (x) =>
        new PtvProposedDisruption(
          x.id,
          x.title,
          x.description,
          x.affectedLines,
          x.affectedStops,
          x.url,
          x.starts,
          x.ends,
        ),
    );

  toJSON(): z.input<typeof PtvProposedDisruption.json> {
    return {
      id: this.id.toJSON(),
      title: this.title,
      description: this.description,
      affectedLines: this.affectedLines,
      affectedStops: this.affectedStops,
      url: this.url,
      starts: this.starts?.toJSON() ?? null,
      ends: this.ends?.toJSON() ?? null,
    };
  }
}

export class PtvProposedDisruptionFactory extends ProposedDisruptionFactory {
  constructor() {
    super(proposedDisruptionType);
  }

  get jsonSchema(): z.ZodType<ProposedDisruption, any, any> {
    return PtvProposedDisruption.json;
  }

  toJson(disruption: ProposedDisruption): unknown {
    if (disruption instanceof PtvProposedDisruption) {
      return disruption.toJSON();
    }
    this._throwSinceBadType(disruption);
  }
}
