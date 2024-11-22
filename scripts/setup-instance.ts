/* eslint-disable no-console */

import fsp from "fs/promises";
import { execSync } from "child_process";
import readline from "readline/promises";
import { z } from "zod";

// Note: This wouldn't work for env vars, those will still need to be supplied
// manually. Should consumer repos be able to specify which env vars they need
// in a standard format?

// Note: How will the consumer repo be able to import it's own node modules?
// Will having a nested package.json in the instance folder work?

// Note: Imports to "trainquery" will need to be converted to relative imports,
// e.g. `import app from "trainquery"` -> `import app from "../index"`.

const instanceDir = "instance";
const manifestFile = "instance.json";

const manifestSchema = z.object({
  environmentVariables: z
    .object({
      var: z.string(),
      examples: z.string().array().default([]),
    })
    .array(),
});

await fsp.rm(instanceDir, { recursive: true, force: true });
await fsp.mkdir(instanceDir);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let repo = await rl.question("💬 Enter the URL of the consumer repo: ");

// <TEMPORARY>
if (repo.length !== 1) {
  repo += "https://github.com/dan-schel/trainquery-melbourne";
}
// </TEMPORARY>

console.log(`Cloning "${repo}"...`);
execSync(`git clone ${repo} ${instanceDir}`, { stdio: "ignore" });

console.log("Installing dependencies...");
execSync(`npm install --prefix ${instanceDir}`, { stdio: "ignore" });

console.log(`Reading "${manifestFile}"...`);
let manifest: z.infer<typeof manifestSchema> | null = null;
let manifestText = "";
try {
  manifestText = await fsp.readFile(`${instanceDir}/${manifestFile}`, "utf-8");
} catch {
  console.error(`⚠️ No "${manifestFile}" file found.`);
}

if (manifestText.length !== 0) {
  try {
    manifest = manifestSchema.parse(JSON.parse(manifestText));
  } catch {
    throw new Error(`Failed to read "${manifestFile}".`);
  }
}

if (manifest != null) {
  // TODO: Guide the user through setting up environment variables. Before
  // deleting the previous instance, parse the existing .env file (if present)
  // and use those as the default values (can use dotenv npm package to parse).
}

// Replace imports to "trainquery" with relative imports.

console.log("✅ Done.");

rl.close();
