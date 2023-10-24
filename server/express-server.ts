import { BadApiCallError } from "./param-utils";
import { Server, ServerParams, TrainQuery } from "./trainquery";
import express, { Express } from "express";
import { rateLimit } from "express-rate-limit";

// Rate limit if a user makes 100 requests in 5 minutes (3 seconds/request).
const rateLimitWindow = 1000 * 60 * 5;
const rateLimitRequests = 100;

function nullMiddleware() {
  return (
    _req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ) => {
    next();
  };
}

export class ExpressServer extends Server {
  constructor(
    readonly port: number,
    private readonly _setupFrontend: (
      ctx: TrainQuery,
      app: Express,
    ) => Promise<void>,
    /**
     * How many proxies there are between the client and express server.
     * (https://github.com/express-rate-limit/express-rate-limit/wiki/Troubleshooting-Proxy-Issues)
     */
    readonly proxies: number,
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
    app.set("trust proxy", this.proxies);

    const apiRateLimit = ctx.isProduction
      ? rateLimit({
          windowMs: rateLimitWindow,
          limit: rateLimitRequests,
        })
      : nullMiddleware();

    app.get("/ip", (request, response) => response.send(request.ip));

    app.get("/api/*", apiRateLimit, async (req, res) => {
      const path = req.path.replace(/^\/api\//, "");

      try {
        const data = await requestListener(path, req.query as ServerParams);
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
