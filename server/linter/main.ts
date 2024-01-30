import { ZodError } from "zod";
import { OfflineConfigProvider } from "../config/offline-config-provider";
import { OnlineConfigProvider } from "../config/online-config-provider";
import { lint } from "./lint";
import chalk from "chalk";
import "dotenv/config";
import { EnvironmentVariables } from "../environment-variables";

main();

async function main() {
  if (process.argv.length !== 3) {
    console.log("Usage: npm run tqlint -- [url/path to zip]");
    return;
  }

  const arg = process.argv[2];
  const provider = (() => {
    const canonicalUrl = EnvironmentVariables.get().url;

    if (arg === "online") {
      const configUrl = EnvironmentVariables.get().config;
      console.log(`Linting "${configUrl}"...`);
      return new OnlineConfigProvider(configUrl, canonicalUrl);
    } else if (arg === "offline") {
      const zipOrFolderPath = EnvironmentVariables.get().requireConfigOffline();
      console.log(`Linting "${zipOrFolderPath}"...`);
      return new OfflineConfigProvider(zipOrFolderPath, canonicalUrl);
    } else if (arg.startsWith("http://") || arg.startsWith("https://")) {
      return new OnlineConfigProvider(arg, canonicalUrl);
    }
    return new OfflineConfigProvider(arg, canonicalUrl);
  })();

  try {
    const data = await provider.fetchConfig();
    const results = await lint(data);

    if (results.length === 0) {
      console.log(`${severityHeader("pass")} Looks good!`);
    } else {
      results.forEach((r) => {
        console.log(`${severityHeader(r.severity)} | ${r.message}`);
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.toString());
      console.log(
        `${severityHeader(
          "fatal",
        )} Failed to parse config (invalid schema). See above for details.`,
      );
    } else {
      console.error(`${severityHeader("fatal")} ${error}`);
    }
  }
}

function severityHeader(
  severity: "pass" | "suggestion" | "warning" | "error" | "fatal",
) {
  return {
    pass: chalk.bgGreen.bold(" PASS "),
    suggestion: chalk.bgWhite.bold(" INFO "),
    warning: chalk.bgYellow.bold(" WARN "),
    error: chalk.bgRed.bold(" FAIL "),
    fatal: chalk.bgRed.bold(" FAIL "),
  }[severity];
}
