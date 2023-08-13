import { toLineID, toStopID } from "../../shared/system/ids";
import { OfflineConfigProvider } from "../offline-config-provider";
import { OnlineConfigProvider } from "../online-config-provider";
import { lint } from "./lint";

main();

async function main() {
  if (process.argv.length != 3) {
    console.log("Usage: npm run tqlint -- [url/path to zip]");
    return;
  }

  const arg = process.argv[2];
  const provider = (() => {
    if (arg.startsWith("http://") || arg.startsWith("https://")) {
      return new OnlineConfigProvider(arg);
    }
    return new OfflineConfigProvider(arg);
  })();

  const data = await provider.fetchConfig();
  const results = await lint(data);

  if (results.length == 0) {
    console.log("Looks good!");
  } else {
    results.forEach((r) => {
      console.log(`${r.severity} | ${r.message}`);
    });
  }
}
