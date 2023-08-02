import { getConfig } from "./cached-config";

export function formatPageTitle(pageTitle: string) {
  return `${pageTitle} | ${getConfig().frontend.appName}`;
}
