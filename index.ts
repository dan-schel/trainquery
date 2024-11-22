import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createTodoHandler } from "./server/create-todo-handler";
import { vikeHandler } from "./server/vike-handler";
import { createHandler } from "@universal-middleware/express";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = __dirname;
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const hmrPort = process.env.HMR_PORT
  ? parseInt(process.env.HMR_PORT, 10)
  : 24678;

export type TrainQueryConfig = {
  url: string;
  port: string;

  // TODO: These don't need to be at the top level. E.g. wherever inside the
  // config the relay is used, provide the relayKey there.
  relayKey: string;
  mongoDatabaseUrl: string;
  superadminUsername: string;
  superadminPassword: string;

  // Deprecated.
  config: string;
  ptvDevId: string;
  ptvDevKey: string;
  gtfsRealtimeKey: string;
};

export default async function trainquery(config: TrainQueryConfig) {
  const app = express();

  if (process.env.NODE_ENV === "production") {
    // Use the pre-compiled client code.
    app.use(express.static(`${root}/dist/client`));
  } else {
    // Compile the client code on-the-fly with Vite (enables hot reloading).
    const vite = await import("vite");
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true, hmr: { port: hmrPort } },
      })
    ).middlewares;
    app.use(viteDevMiddleware);
  }

  app.post("/api/todo/create", createHandler(createTodoHandler)());

  if (process.env.NODE_ENV === "production") {
    await import("./dist/server/entry.mjs");
  }
  app.all("*", createHandler(vikeHandler)());

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  return app;
}
