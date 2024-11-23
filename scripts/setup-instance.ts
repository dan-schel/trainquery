/* eslint-disable no-console */

import fsp from "fs/promises";
import { execSync } from "child_process";
import readline from "readline/promises";
import { z } from "zod";
import { parse } from "dotenv";
import { listifyOr } from "@dan-schel/js-utils";

const instanceDir = "instance";
const packageJsonFile = "instance/package.json";
const manifestFile = "instance/instance.json";
const envFile = ".env";
const gitFolder = "instance/.git";
const repoUrlEnvVar = "INSTANCE_REPO_URL";
const ignoreFoldersInSearch = ["instance/node_modules"];

const manifestSchema = z.object({
  environmentVariables: z
    .object({
      name: z.string(),
      description: z.string().optional(),
      examples: z.string().array().optional(),
    })
    .array(),
});

type InstanceManifest = z.infer<typeof manifestSchema>;

await main();

async function main() {
  console.log("==== TrainQuery Setup Script ====");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Before deleting the instance folder, make note of the env vars and repo URL
  // (if present) so we can suggest them as defaults during this setup.
  const existingEnvVars = await readExistingEnvVars();
  const defaultRepo = existingEnvVars[repoUrlEnvVar] ?? null;

  // Ask the repo URL. Do this BEFORE deleting the instance folder, so the user
  // can cancel the script if the default repo hasn't been supplied.
  const repo = await askValue(
    rl,
    "\nEnter the URL of the instance repo",
    defaultRepo,
  );

  // Clean out the instance folder and clone the repo.
  await fsp.rm(instanceDir, { recursive: true, force: true });
  await fsp.mkdir(instanceDir);
  console.log(`\nCloning "${repo}"...`);
  execSync(`git clone ${repo} ${instanceDir}`, { stdio: "ignore" });

  // This stops VSCode showing the instance repo in the version control panel.
  console.log(`Deleting "${gitFolder}" folder...`);
  await fsp.rm(gitFolder, { recursive: true, force: true });

  // Installing trainquery into node_modules is useless at best, since we import
  // from this repo instead of whatever's in NPM. It also avoids any potential
  // problems if dependencies of trainquery are different between this repo and
  // what's published on NPM.
  console.log(`Removing "trainquery" from "${packageJsonFile}"...`);
  await removeTrainqueryFromPackageJson();

  // Install dependencies from the instance repo's package.json, in case the
  // instance repo uses something this repo doesn't have.
  console.log("Installing dependencies...");
  execSync(`npm install --prefix ${instanceDir}`, { stdio: "ignore" });

  // Don't import from "trainquery" on NPM, use the code in this repo (so we can
  // hot-reload, etc.).
  console.log(`\nReplacing "trainquery" imports with relative imports...`);
  await replaceTrainqueryImportsWithRelative();

  // Read the "instance.json" file (if present) and prompt the user to set the
  // environment variables it lists.
  console.log(`\nReading "${manifestFile}"...`);
  const manifest = await readManifest();
  const envVars = await askEnvVars(rl, manifest, existingEnvVars);
  await writeEnvVars(envVars, repo);

  console.log("\n✅ Done.");
  rl.close();
}

async function readExistingEnvVars(): Promise<Record<string, string>> {
  let envStr: string | null = null;
  try {
    envStr = await fsp.readFile(`${envFile}`, "utf-8");
  } catch {
    console.warn(`No existing "${envFile}" file found.`);
    return {};
  }

  try {
    return parse(envStr);
  } catch {
    throw new Error(`Failed to parse "${envFile}".`);
  }
}

async function askValue(
  rl: readline.Interface,
  question: string,
  defaultValue?: string | null,
) {
  const suffix =
    defaultValue != null ? ` (press ENTER for "${defaultValue}")` : "";
  const response = await rl.question(`${question}${suffix}: `);

  if (response.length === 0) {
    return defaultValue ?? response;
  } else {
    return response;
  }
}

async function replaceTrainqueryImportsWithRelative() {
  await replaceInDirectory(
    instanceDir,
    ' from "trainquery";',
    1,
    (depth) => ` from "${"../".repeat(depth)}index";`,
  );
}

async function replaceInDirectory(
  directory: string,
  from: string,
  depth: number,
  to: (depth: number) => string,
) {
  const files = await fsp.readdir(directory);
  for (const file of files) {
    const path = `${directory}/${file}`;
    const stat = await fsp.stat(path);
    if (stat.isDirectory() && !ignoreFoldersInSearch.includes(file)) {
      await replaceInDirectory(path, from, depth + 1, to);
    } else if (stat.isFile() && file.endsWith(".ts")) {
      const contents = await fsp.readFile(path, "utf-8");
      if (contents.includes(from)) {
        console.log(`- ${path}`);
      }
      await fsp.writeFile(path, contents.replace(from, to(depth)));
    }
  }
}

async function removeTrainqueryFromPackageJson() {
  const packageJsonStr = await fsp.readFile(packageJsonFile, "utf-8");
  const packageJson = JSON.parse(packageJsonStr);
  delete packageJson.dependencies.trainquery;
  await fsp.writeFile(packageJsonFile, JSON.stringify(packageJson, null, 2));
}

async function readManifest(): Promise<InstanceManifest> {
  let manifestText = "";
  try {
    manifestText = await fsp.readFile(manifestFile, "utf-8");
  } catch {
    console.warn(`No "${manifestFile}" file found.`);
    return { environmentVariables: [] };
  }

  try {
    return manifestSchema.parse(JSON.parse(manifestText));
  } catch {
    throw new Error(`Failed to read "${manifestFile}".`);
  }
}

async function askEnvVars(
  rl: readline.Interface,
  manifest: InstanceManifest,
  existingEnvVars: Record<string, string>,
) {
  const envVars: Record<string, string> = {};

  for (const i in manifest.environmentVariables) {
    const { name, description, examples } = manifest.environmentVariables[i];
    console.log(`\nSet ${name}`);
    if (description != null && description.length !== 0) {
      console.log(`  ${description}`);
    }
    if (examples != null && examples.length !== 0) {
      console.log(`  e.g. ${listifyOr(examples.map((x) => `"${x}"`))}`);
    }

    const defaultValue = existingEnvVars[name] ?? examples?.[0];
    envVars[name] = await askValue(rl, "  Enter value", defaultValue);
  }

  return envVars;
}

async function writeEnvVars(envVars: Record<string, string>, repoUrl: string) {
  // TODO: This won't work for env vars which contain special characters that
  // need escaping.
  const envStr = Object.entries(envVars)
    .map(([key, value]) => `${key}="${value}"\n`)
    .join("");

  const repoName = repoUrl.split("/").slice(-1)[0].replace(".git", "");

  const fullEnvStr = `# Meta\n${repoUrlEnvVar}="${repoUrl}"\n\n# For ${repoName}\n${envStr}`;
  await fsp.writeFile(envFile, fullEnvStr);
}
