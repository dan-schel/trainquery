import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "./server/main";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = __dirname;

export type TrainQueryConfig = {
  devMode: boolean;
  port: number;
  hmrPort: number;
  url: string;

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
  createServer(config, root);
}
