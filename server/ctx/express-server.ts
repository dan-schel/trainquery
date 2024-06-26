import { BadApiCallError } from "../param-utils";
import { Server, ServerParams, TrainQuery } from "./trainquery";
import express, { Express } from "express";

const ignoreLoggingApiRoutes = ["ssrAppProps", "config"];

export class ExpressServer extends Server {
  constructor(
    readonly port: number,
    private readonly _setupFrontend: (
      ctx: TrainQuery,
      app: Express,
    ) => Promise<void>,
  ) {
    super();
  }

  async start(
    ctx: TrainQuery,
    requestListener: (
      endpoint: string,
      params: ServerParams,
    ) => Promise<object>,
  ): Promise<void> {
    const app = express();
    app.use(express.json());

    app.all("/api/*", async (req, res) => {
      const path = req.path.replace(/^\/api\//, "");

      if (!ignoreLoggingApiRoutes.includes(path)) {
        const ip = req.ip ?? "<unknown>";
        const userAgent = req.header("user-agent") ?? "<unknown>";

        if (path === "ssrRouteProps") {
          if (userAgent !== "node") {
            const path = String(req.query.path ?? "<unknown>");
            ctx.logger.logPageRequest(path, ip, userAgent, true);
          }
        } else {
          ctx.logger.logApiRequest(req.url, ip, userAgent);
        }
      }

      try {
        const params: ServerParams = {
          query: paramify(req.query),
          body: paramify(req.body),
          header: {
            adminToken: req.header("admin-token") ?? null,
          },
        };
        const data = await requestListener(path, params);
        res.json(data);
      } catch (e) {
        if (BadApiCallError.detect(e)) {
          res.status(e.statusCode).send(e.message);
        } else {
          console.warn(e);
          res.status(500).send("Internal server error.");
        }
      }
    });

    this._setupFrontend(ctx, app);

    await new Promise<void>((resolve) => app.listen(this.port, resolve));
  }
}

function paramify(obj: { [index: string]: any }): Record<string, string> {
  if (typeof obj !== "object" || obj == null) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      result[key] = value;
    }
  }
  return result;
}
