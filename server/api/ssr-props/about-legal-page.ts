import { TrainQuery } from "../../ctx/trainquery";

export function getAboutLegalPageProps(ctx: TrainQuery) {
  return {
    additionalMessages: ctx.getConfig().server.legal.toJSON(),
  };
}
