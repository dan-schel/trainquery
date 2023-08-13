import { OfflineConfigProvider } from "./offline-config-provider";
import { OnlineConfigProvider } from "./online-config-provider";

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

  console.log(data.shared.stops.length);
}
