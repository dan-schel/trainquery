import { z } from "zod";
import { DisruptionData } from "./disruption-data";
import { GenericLineDisruptionData } from "./types/generic-line";
import { GenericStopDisruptionData } from "./types/generic-stop";
import { ExternalDisruption } from "../external/external-disruption";
import {
  type DisruptionID,
  DisruptionIDJson,
  ExternalDisruptionID,
} from "../../system/ids";

export const DisruptionStates = [
  "provisional",
  "generated",
  "approved",
  "curated",
  "approved-auto-delete",
  "curated-auto-delete",
] as const;
export type DisruptionState = (typeof DisruptionStates)[number];
export const DisruptionStateJson = z.enum(DisruptionStates);

export class Disruption {
  readonly type: string;

  constructor(
    readonly id: DisruptionID,
    readonly data: DisruptionData,
    readonly state: DisruptionState,
    readonly sources: ExternalDisruption[],
    readonly updatedSources: ExternalDisruption[] | null,
  ) {
    this.type = data.getType();
  }

  usesSource(id: ExternalDisruptionID) {
    return this.sources.some((s) => s.id === id);
  }

  with({
    id,
    data,
    state,
    sources,
    updatedSources,
  }: {
    id?: DisruptionID;
    data?: DisruptionData;
    state?: DisruptionState;
    sources?: ExternalDisruption[];
    updatedSources?: ExternalDisruption[] | null;
  }) {
    return new Disruption(
      id ?? this.id,
      data ?? this.data,
      state ?? this.state,
      sources ?? this.sources,
      updatedSources === undefined ? this.updatedSources : updatedSources,
    );
  }

  static readonly json = z
    .intersection(
      z.discriminatedUnion("type", [
        z.object({
          type: z.literal(GenericLineDisruptionData.type),
          data: GenericLineDisruptionData.json,
        }),
        z.object({
          type: z.literal(GenericStopDisruptionData.type),
          data: GenericStopDisruptionData.json,
        }),
      ]),
      z.object({
        id: DisruptionIDJson,
        state: DisruptionStateJson,
        sources: ExternalDisruption.json.array(),
        updatedSources: ExternalDisruption.json.array().nullable(),
      }),
    )
    .transform(
      (x) => new Disruption(x.id, x.data, x.state, x.sources, x.updatedSources),
    );

  toJSON(): z.input<typeof Disruption.json> {
    const shared = {
      id: this.id,
      state: this.state,
      sources: this.sources.map((x) => x.toJSON()),
      updatedSources: this.updatedSources?.map((x) => x.toJSON()) ?? null,
    };

    if (this.data instanceof GenericLineDisruptionData) {
      return {
        type: GenericLineDisruptionData.type,
        data: this.data.toJSON(),
        ...shared,
      };
    }
    if (this.data instanceof GenericStopDisruptionData) {
      return {
        type: GenericStopDisruptionData.type,
        data: this.data.toJSON(),
        ...shared,
      };
    }

    const className = this.data.constructor.name;
    throw new Error(`Unknown DisruptionData type: ${className}`);
  }
}
