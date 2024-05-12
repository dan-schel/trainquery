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
import { hashString } from "../../../system/cyrb53";

const proposedDisruptionType = "ptv";

export class PtvProposedDisruption extends ProposedDisruption {
  constructor(
    id: ProposedDisruptionID,
    starts: QUtcDateTime | null,
    ends: QUtcDateTime | null,
    readonly title: string,
    readonly description: string,
    readonly affectedLines: LineID[],
    readonly affectedStops: StopID[],
    readonly url: string | null,
  ) {
    // TODO: I realise title is only being used for summary, so the field is
    // essentially duplicated. I feel that it makes sense to "generate" the
    // summary from the title (and not the description, for example), but idk,
    // this is weird.
    super(
      proposedDisruptionType,
      id,
      title,
      starts,
      ends,
      PtvProposedDisruption.hash(
        title,
        description,
        affectedLines,
        affectedStops,
        url,
        starts,
        ends,
      ),
    );
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

  static hash(
    title: string,
    description: string,
    affectedLines: LineID[],
    affectedStops: StopID[],
    url: string | null,
    starts: QUtcDateTime | null,
    ends: QUtcDateTime | null,
  ): string {
    return hashString(
      JSON.stringify({
        title: title,
        description: description,
        affectedLines: affectedLines,
        affectedStops: affectedStops,
        url: url,
        starts: starts?.toJSON(),
        ends: ends?.toJSON(),
      }),
    );
  }

  static readonly json = z
    .object({
      id: ProposedDisruptionID.json,
      starts: QUtcDateTime.json.nullable(),
      ends: QUtcDateTime.json.nullable(),
      title: z.string(),
      description: z.string(),
      affectedLines: LineIDJson.array(),
      affectedStops: StopIDJson.array(),
      url: z.string().nullable(),
    })
    .transform(
      (x) =>
        new PtvProposedDisruption(
          x.id,
          x.starts,
          x.ends,
          x.title,
          x.description,
          x.affectedLines,
          x.affectedStops,
          x.url,
        ),
    );

  toJSON(): z.input<typeof PtvProposedDisruption.json> {
    return {
      id: this.id.toJSON(),
      starts: this.starts?.toJSON() ?? null,
      ends: this.ends?.toJSON() ?? null,
      title: this.title,
      description: this.description,
      affectedLines: this.affectedLines,
      affectedStops: this.affectedStops,
      url: this.url,
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
