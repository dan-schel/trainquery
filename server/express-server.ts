import { Server } from "./trainquery";
import express, { Express } from "express";

export class ExpressServer extends Server {
  constructor(
    readonly port: number,
    private readonly _setupFrontend: (app: Express) => Promise<void>
  ) {
    super();
    this.port = port;
    this._setupFrontend = _setupFrontend;
  }

  async start(
    requestListener: (endpoint: string) => Promise<unknown>
  ): Promise<void> {
    const app = express();

    app.get("/api/*", async (req, res) => {
      const path = req.path.replace(/^\/api\//, "");
      const data = await requestListener(path);

      if (data != null) {
        res.json(data);
      } else {
        res.sendStatus(404);
      }
    });

    this._setupFrontend(app);

    await new Promise<void>((resolve) => app.listen(this.port, resolve));
  }
}
