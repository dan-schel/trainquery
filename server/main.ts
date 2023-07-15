import express from "express";
import { createSsrServer } from "vite-ssr/dev";

async function createServer() {
  const app = express();

  // Create vite-ssr server in middleware mode.
  const viteServer = await createSsrServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  // Use vite's connect instance as middleware
  app.use(viteServer.middlewares);

  const port = 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

createServer();
