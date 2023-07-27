import { Express } from "express";
import { Server } from "./trainquery";

export class ExpressServer extends Server {
  constructor(private readonly _app: Express) {
    super();
    this._app = _app;
  }

  start(): void {
    this._app.get("/api/hello", (_req, res) => {
      res.json({ hello: "world" });
    });
  }
}
