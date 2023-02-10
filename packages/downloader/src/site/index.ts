import DefaultSite from "./default";
import Rapidgator from "./rapidgator";
import { Site } from "./site";

const defaultSite = new DefaultSite()

export const sites: Site[] = [
  new Rapidgator(),
  defaultSite,
]

export function findWebsite(downloadUrl: string): Site {
  return sites.find(site => site.match(downloadUrl)) || defaultSite
}
