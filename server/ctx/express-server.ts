import { z } from "zod";
import { ApiHandler, BadApiCallError } from "../api/api-handler";
import { Server, TrainQuery } from "./trainquery";
import express, { Express } from "express";
import { Session } from "../../shared/admin/session";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handlers: ApiHandler<any, any, any, any>[],
  ): Promise<void> {
    const app = express();
    app.use(express.json());

    for (const handler of handlers) {
      createApiRoute(ctx, app, handler);
    }

    this._setupFrontend(ctx, app);

    await new Promise<void>((resolve) => app.listen(this.port, resolve));
  }
}

function createApiRoute<P, R, PS, RS>(
  ctx: TrainQuery,
  app: express.Application,
  handler: ApiHandler<P, R, PS, RS>,
) {
  const { api, handler: handlerFunction } = handler;

  app.post(`/api/${api.endpoint}`, async (req, res) => {
    try {
      let session: Session | null = null;

      if (api.requiredRole != null) {
        const parsedToken = z
          .string()
          .optional()
          .safeParse(req.headers["admin-token"]);
        const token = parsedToken.success ? (parsedToken.data ?? null) : null;
        await ctx.adminAuth.throwUnlessAuthenticated(token, api.requiredRole);
        if (token != null) {
          session = await ctx.adminAuth.getSession(token);
        }
      }

      const parsed = api.paramsSchema.safeParse(req.body.params);

      if (!parsed.success) {
        res.status(400).send(`Invalid params.\n\n${parsed.error}`);
        return;
      }

      const result = await handlerFunction(ctx, parsed.data, session);

      res.json({
        result: api.resultSerializer(result),
        hash: api.checkConfigHash ? ctx.getConfig().hash : undefined,
      });
    } catch (e) {
      if (BadApiCallError.detect(e)) {
        res.status(e.statusCode).send(e.message);
      } else {
        console.warn(e);
        res.status(500).send("Internal server error.");
      }
    }
  });
}
