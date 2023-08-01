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

  async start(): Promise<void> {
    const app = express();

    app.get("/api/hello", (_req, res) => {
      res.json({ hello: "world" });
    });

    this._setupFrontend(app);

    await new Promise<void>((resolve) => app.listen(this.port, resolve));
  }
}
