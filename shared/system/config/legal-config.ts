import { z } from "zod";

export class LicenseAttribution {
  constructor(
    readonly title: string,
    readonly message: string,
    readonly links: { text: string; url: string }[],
  ) {}

  static readonly json = z
    .object({
      title: z.string(),
      message: z.string(),
      links: z.array(
        z.object({
          text: z.string(),
          url: z.string(),
        }),
      ),
    })
    .transform((x) => new LicenseAttribution(x.title, x.message, x.links));

  toJSON(): z.input<typeof LicenseAttribution.json> {
    return {
      title: this.title,
      message: this.message,
      links: this.links,
    };
  }
}

export class LegalConfig {
  static default = new LegalConfig([]);

  constructor(readonly timetableData: LicenseAttribution[]) {}

  static readonly json = z
    .object({
      timetableData: LicenseAttribution.json.array(),
    })
    .transform((x) => new LegalConfig(x.timetableData));

  toJSON(): z.input<typeof LegalConfig.json> {
    return {
      timetableData: this.timetableData.map((x) => x.toJSON()),
    };
  }
}
