import type { UseHeadInput } from "@vueuse/head";
import { getConfig } from "./get-config";

export function generatePageHead({
  title: rawTitle,
  description: rawDescription,
  allowIndexing,
  canonicalUrl,
}: {
  title: string;
  description?: string;
  allowIndexing: boolean;
  canonicalUrl: string | null;
}): UseHeadInput<{}> {
  const config = getConfig();
  const baseUrl = config.shared.canonicalUrl;

  const title = `${rawTitle} | ${config.frontend.appName}`;
  const description = rawDescription ?? config.frontend.metaDescription;

  return {
    title: title,
    meta: [
      { name: "og:title", content: title },
      { name: "description", content: description },
      { name: "og:description", content: description },

      { name: "robots", content: allowIndexing ? "all" : "noindex" },

      { name: "og:type", content: "website" },
      {
        name: "og:image",
        content: config.shared.canonicalUrl + "/ogimage.png",
      },
      { name: "og:image:width", content: "1200" },
      { name: "og:image:height", content: "600" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    link:
      canonicalUrl != null
        ? [{ rel: "canonical", href: baseUrl + canonicalUrl }]
        : [],
  };
}

export function generatePageHeadNotFound(title: string): UseHeadInput<{}> {
  const config = getConfig();
  const titleWithAppName = `${title} | ${config.frontend.appName}`;

  return {
    title: titleWithAppName,
    meta: [{ name: "robots", content: "noindex" }],
  };
}
