import { uuid } from "@dan-schel/js-utils";
import fetch from "node-fetch";
import fs from "fs";
import fsp from "fs/promises";
import AdmZip from "adm-zip";

export function generateDataFolderPath(): string {
  return `data-${uuid()}`;
}

export async function download(
  url: string,
  destinationPath: string,
  headers: Record<string, string> = {},
) {
  const response = await fetch(url, { headers: headers });

  await new Promise<void>((resolve, reject) => {
    if (response.body == null) {
      throw new Error(`Failed to download "${url}".`);
    }

    const destination = fs.createWriteStream(destinationPath);

    response.body.pipe(destination);
    response.body.on("error", () => reject());
    destination.on("error", () => reject());
    destination.on("finish", resolve);
  });
}

export async function deleteDataFolder(dataFolder: string) {
  await fsp.rm(dataFolder, {
    recursive: true,
    force: true,
    retryDelay: 100,
    maxRetries: 5,
  });
}

export async function extractZip(zip: AdmZip, location: string): Promise<void> {
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
