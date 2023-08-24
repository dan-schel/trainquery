import { Server, ServerParams, TrainQuery } from "./trainquery";
import express, { Express } from "express";

export class ExpressServer extends Server {
  constructor(
    readonly port: number,
    private readonly _setupFrontend: (
      ctx: TrainQuery,
      app: Express
    ) => Promise<void>
  ) {
    super();
  }

  async start(
    ctx: TrainQuery,
    requestListener: (
      endpoint: string,
      params: ServerParams
    ) => Promise<unknown>
  ): Promise<void> {
    const app = express();

    app.get("/api/*", async (req, res) => {
      const path = req.path.replace(/^\/api\//, "");
      const data = await requestListener(path, req.query as ServerParams);

      if (data != null) {
        res.json(data);
      } else {
        res.sendStatus(404);
      }
    });

    this._setupFrontend(ctx, app);

    await new Promise<void>((resolve) => app.listen(this.port, resolve));
  }
}
