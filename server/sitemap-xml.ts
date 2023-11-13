import {
  HasSharedConfig,
  getLinePageRoute,
  getStopPageRoute,
} from "../shared/system/config-utils";
import { LineID, StopID } from "../shared/system/ids";

export function createSitemapXml(config: HasSharedConfig): string {
  const lines = config.shared.lines.map((l) => line(config, l.id));
  const stops = config.shared.stops.map((s) => stop(config, s.id));

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${config.shared.canonicalUrl}/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${config.shared.canonicalUrl}/lines</loc>
    <priority>0.1</priority>
  </url>
  <url>
    <loc>${config.shared.canonicalUrl}/about</loc>
    <priority>0.1</priority>
  </url>
${lines.join("\n")}
${stops.join("\n")}
</urlset>`;

  return xml;
}

function line(config: HasSharedConfig, line: LineID) {
  const route = getLinePageRoute(config, line);
  return `  <url>
    <loc>${config.shared.canonicalUrl}${route}</loc>
    <priority>0.8</priority>
  </url>`;
}
function stop(config: HasSharedConfig, stop: StopID) {
  const route = getStopPageRoute(config, stop, null, null);
  return `  <url>
    <loc>${config.shared.canonicalUrl}${route}</loc>
    <priority>0.6</priority>
  </url>`;
}
