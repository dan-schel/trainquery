import { z } from "zod";

export class Banner {
  constructor(readonly messageMarkdown: string) {}

  static readonly json = z
    .object({
      messageMarkdown: z.string(),
    })
    .transform((x) => new Banner(x.messageMarkdown));

  toJSON(): z.input<typeof Banner.json> {
    return {
      messageMarkdown: this.messageMarkdown,
    };
  }
}
