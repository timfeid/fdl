import Download from "@fdl/downloader";
export {findExtractor} from './extractors'
import { Extractor } from "./extractors/extractor";

export async function extract (extractor: Extractor, downloads: Download[]) {
  // const extractor = findExtractor(info)
  return extractor.extract(downloads)
}

export {Extractor}
