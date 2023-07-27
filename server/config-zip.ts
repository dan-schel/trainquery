import AdmZip from "adm-zip";
import { ServerConfig } from "../shared/system/config";
import fsp from "fs/promises";
import path from "path";
import YAML from "yaml";

export async function loadConfigFromZip(
  dataFolder: string,
  zipPath: string
): Promise<ServerConfig> {
  const zip = new AdmZip(zipPath);
  await extractZip(zip, dataFolder);

  const config = await fsp.readFile(path.join(dataFolder, "config.yml"), {
    encoding: "utf-8",
  });
  const obj = YAML.parse(config);

  return await ServerConfig.fromFile(obj, async (filePath, schema) => {
    const fullPath = path.join(dataFolder, filePath);
    const text = await fsp.readFile(fullPath, { encoding: "utf-8" });
    return schema.parse(YAML.parse(text));
  });
}

async function extractZip(zip: AdmZip, location: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    zip.extractAllToAsync(location, true, false, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
