import express, { Express } from "express";
import { ConfigProvider, TrainQuery, trainQuery } from "./ctx/trainquery";
import { OnlineConfigProvider } from "./config/online-config-provider";
import { ExpressServer } from "./ctx/express-server";
import "dotenv/config";
import { OfflineConfigProvider } from "./config/offline-config-provider";
import { TrainQueryDB } from "./ctx/trainquery-db";
import { createSitemapXml } from "./sitemap-xml";
import { EnvironmentVariables } from "./ctx/environment-variables";
import { EnvironmentOptions } from "./ctx/environment-options";
import { AdminLogger } from "./ctx/admin-logger";
import { createTodoHandler } from "./create-todo-handler";
import { vikeHandler } from "./vike-handler";
import { createHandler } from "@universal-middleware/express";
import { TrainQueryConfig } from "..";

export async function createServer(config: TrainQueryConfig, root: string) {
  EnvironmentVariables.set(config);

  const instanceID = generateInstanceID();

  const isProd = EnvironmentVariables.get().isProduction();
  const envOptions = await getEnvironmentOptions(isProd);

  const logger = new AdminLogger(instanceID, envOptions.logging);
  logger.logInstanceStarting(instanceID);
  logger.logEnvOptions(envOptions);

  const isOffline = process.argv.includes("offline");
  const useOfflineData =
    process.argv.includes("offline-data") ||
    process.argv.includes("data-offline");
  const port = EnvironmentVariables.get().port;

  const serveFrontend = async (ctx: TrainQuery, app: Express) => {
    if (isProd) {
      await setupProdServer(ctx, app, root);
    } else {
      await setupDevServer(ctx, app, root, config.hmrPort);
    }
  };

  await trainQuery(
    instanceID,
    () => new ExpressServer(port, serveFrontend),
    getConfigProvider(isOffline || useOfflineData),
    getDatabase(isOffline),
    logger,
    isOffline,
    isProd,
  );
}

async function getEnvironmentOptions(isProd: boolean) {
  const index = process.argv.findIndex((x) => x === "--env");
  if (index === -1) {
    return EnvironmentOptions.default(isProd);
  }

  let name = process.argv.length >= index + 2 ? process.argv[index + 1] : null;
  if (name === null) {
    throw new Error(`Missing environment name after "--env".`);
  }

  if (name === "file") {
    name = ".env-options.json";
  }

  if (name.endsWith(".json")) {
    try {
      return await EnvironmentOptions.loadFromFile(name);
    } catch {
      throw new Error(`Failed to load environment from file "${name}".`);
    }
  } else {
    const env = EnvironmentOptions.loadFromName(name);
    if (env == null) {
      throw new Error(`Unknown environment name "${name}".`);
    }
    return env;
  }
}

function getConfigProvider(useOfflineData: boolean): ConfigProvider {
  const canonicalUrl = EnvironmentVariables.get().url;
  if (useOfflineData) {
    const zipOrFolderPath = EnvironmentVariables.get().requireConfigOffline();
    return new OfflineConfigProvider(zipOrFolderPath, canonicalUrl);
  } else {
    const configUrl = EnvironmentVariables.get().config;
    return new OnlineConfigProvider(configUrl, canonicalUrl);
  }
}

function getDatabase(isOffline: boolean): TrainQueryDB | null {
  if (isOffline) {
    return null;
  }

  const mongo = EnvironmentVariables.get().mongo;
  if (mongo == null) {
    return null;
  }
  return new TrainQueryDB(mongo.databaseUrl);
}

async function setupDevServer(
  ctx: TrainQuery,
  app: Express,
  root: string,
  hmrPort: number,
) {
  serveSitemapXml(app, ctx);

  // Compile the client code on-the-fly with Vite (enables hot reloading).
  const vite = await import("vite");
  const viteDevMiddleware = (
    await vite.createServer({
      root,
      server: { middlewareMode: true, hmr: { port: hmrPort } },
    })
  ).middlewares;
  app.use(viteDevMiddleware);

  app.post("/api/todo/create", createHandler(createTodoHandler)());
  app.all("*", createHandler(vikeHandler)());
}

async function setupProdServer(ctx: TrainQuery, app: Express, root: string) {
  serveSitemapXml(app, ctx);

  // Use the pre-compiled client code.
  app.use(express.static(`${root}/dist/client`));

  app.post("/api/todo/create", createHandler(createTodoHandler)());

  // Stop lint errors when "npm run build" hasn't been run yet (this file is
  // only used in the production build).
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await import(`${root}/dist/server/entry.mjs`);
  app.all("*", createHandler(vikeHandler)());
}

function serveSitemapXml(app: Express, ctx: TrainQuery) {
  app.get("/sitemap.xml", (_req, res) => {
    const xml = createSitemapXml(ctx.getConfig());
    res.set("Content-Type", "text/xml").send(xml);
  });
}

function generateInstanceID(): string {
  return crypto
    .getRandomValues(new Uint8Array(4))
    .reduce((str, x) => str + x.toString(16).padStart(2, "0"), "");
}
