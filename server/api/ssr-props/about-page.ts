import { TrainQuery } from "../../ctx/trainquery";

export function getAboutPageProps(ctx: TrainQuery) {
  return {
    aboutMarkdown: ctx.getConfig().server.aboutMarkdown,
  };
}
