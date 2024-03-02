import { z } from "zod";

export class Banner {
  constructor(
    readonly id: string,
    readonly messageMarkdown: string,
    readonly dismissable: "true" | "false" | "each-day",
  ) {}

  static readonly json = z
    .object({
      id: z.string(),
      messageMarkdown: z.string(),
      dismissable: z.enum(["true", "false", "each-day"]),
    })
    .transform((x) => new Banner(x.id, x.messageMarkdown, x.dismissable));

  toJSON(): z.input<typeof Banner.json> {
    return {
      id: this.id,
      messageMarkdown: this.messageMarkdown,
      dismissable: this.dismissable,
    };
  }
}
