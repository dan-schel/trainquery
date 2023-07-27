import AdmZip from "adm-zip";
import { ServerConfig } from "../shared/system/config";
import { SharedConfig, ServerOnlyConfig, FrontendOnlyConfig } from "../shared/system/config-elements";

export async function loadConfigFromZip(dataFolder: string, zipPath: string): Promise<ServerConfig> {
  const zip = new AdmZip(zipPath);

  await new Promise<void>((resolve, reject) => {
    zip.extractAllToAsync(dataFolder, true, false, error => {
      if (error) { reject(error); }
      else { resolve(); }
    });
  });

  return new ServerConfig(
    new SharedConfig([], [], true, { offset: 0 }, []),
    new ServerOnlyConfig(),
    new FrontendOnlyConfig("", false, "", "", "")
  );
}
